import { useState, useEffect } from 'react';
import { Plus, User, FileText, Check, Trash2, Edit, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PersonForm from '../components/PersonForm';

export default function PeoplePage() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<'tenants' | 'guarantors'>('tenants');
    const [people, setPeople] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Tenant/Guarantor Form Data
    const [formData, setFormData] = useState({
        name: '',
        document: '', // CPF/CNPJ
        email: '',
        phone: '',
        tenantId: '' // Only for Guarantor
    });

    const [tenantsList, setTenantsList] = useState<any[]>([]); // For guarantor dropdown

    useEffect(() => {
        fetchPeople();
        if (activeTab === 'guarantors') {
            fetchTenantsForDropdown();
        }
    }, [activeTab]);

    const fetchPeople = async () => {
        const endpoint = activeTab === 'tenants' ? '/api/tenants' : '/api/guarantors';
        try {
            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setPeople(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTenantsForDropdown = async () => {
        try {
            const res = await fetch('/api/tenants', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setTenantsList(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', document: '', email: '', phone: '', tenantId: '' });
        setEditId(null);
        setShowForm(false);
    };

    const handleEdit = (person: any) => {
        setEditId(person.id);
        setFormData({
            name: person.name,
            document: person.document,
            email: person.email || '',
            phone: person.phone || '',
            tenantId: person.tenantId || ''
        });
        setShowForm(true);
    };

    const handleCreateUser = async (id: string, name: string) => {
        if (!window.confirm(`Criar acesso de usuário para "${name}"?\nIsso irá gerar uma senha temporária.`)) return;

        try {
            const res = await fetch(`/api/tenants/${id}/user`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Usuário criado com sucesso!\nEmail: ${data.email}\nSenha Temporária: ${data.tempPassword}`);
            } else {
                alert(`Erro: ${data.message || 'Falha ao criar usuário'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão.');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

        const endpoint = activeTab === 'tenants' ? `/api/tenants/${id}` : `/api/guarantors/${id}`;
        try {
            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchPeople();
            else alert('Erro ao excluir. Verifique se não há contratos vinculados.');
        } catch (error) { console.error(error); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const baseUrl = activeTab === 'tenants' ? '/api/tenants' : '/api/guarantors';
        const url = editId ? `${baseUrl}/${editId}` : baseUrl;
        const method = editId ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                resetForm();
                fetchPeople();
            } else {
                alert('Erro ao salvar cadastro');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div>
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Gestão de Pessoas</h1>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => { setActiveTab('tenants'); setShowForm(false); }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'tenants' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Inquilinos
                    </button>
                    <button
                        onClick={() => { setActiveTab('guarantors'); setShowForm(false); }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'guarantors' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Fiadores
                    </button>
                </div>

                <button
                    onClick={() => {
                        if (showForm) resetForm();
                        else setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    {showForm ? 'Cancelar' : `Novo ${activeTab === 'tenants' ? 'Inquilino' : 'Fiador'}`}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="mb-8">
                    <PersonForm
                        type={activeTab === 'tenants' ? 'tenant' : 'guarantor'}
                        token={token || ''}
                        onSuccess={() => {
                            resetForm();
                            fetchPeople();
                        }}
                        onCancel={resetForm}
                        initialData={editId ? people.find(p => p.id === editId) : undefined}
                        tenantsList={tenantsList}
                    />
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {people.map((p) => (
                    <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 justify-between group">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${activeTab === 'tenants' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                {activeTab === 'tenants' ? <User size={24} /> : <FileText size={24} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{p.name}</h3>
                                <p className="text-sm text-gray-500">{p.email}</p>
                                <p className="text-xs text-gray-400 mt-1">{p.document}</p>
                                {p.tenantId && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mt-2 inline-block">Fiador Vinculado</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {activeTab === 'tenants' && (
                                <button
                                    onClick={() => handleCreateUser(p.id, p.name)}
                                    className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                    title="Criar Acesso de Usuário"
                                >
                                    <Key size={18} />
                                </button>
                            )}
                            <button
                                onClick={() => handleEdit(p)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(p.id, p.name)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {people.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed col-span-full">
                    <User size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Nenhum registro encontrado.</p>
                </div>
            )}
        </div>
    );
}
