import { useEffect, useState } from 'react';
import { Edit, FileText, Key, Plus, Trash2, User } from 'lucide-react';
import PersonForm from '../components/PersonForm';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

// represents one tenant or guarantor record rendered in the page list
interface PersonRecord {
    id: string;
    name: string;
    document: string;
    email?: string | null;
    phone?: string | null;
    tenantId?: string | null;
}

// represents one tenant option used in the guarantor link dropdown
interface TenantOption {
    id: string;
    name: string;
    document: string;
}

export default function PeoplePage() {
    const { token } = useAuth();

    const [activeTab, setActiveTab] = useState<'tenants' | 'guarantors'>('tenants');
    const [people, setPeople] = useState<PersonRecord[]>([]);
    const [tenantsList, setTenantsList] = useState<TenantOption[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // keeps the page list in sync with the current active tab
    useEffect(() => {
        if (!token) return;

        loadPeople();

        if (activeTab === 'guarantors') {
            loadTenantsForDropdown();
        }
    }, [activeTab, token]);

    // handles loading either tenants or guarantors for the current tab
    const loadPeople = async () => {
        if (!token) return;

        setLoading(true);

        try {
            const data =
                activeTab === 'tenants'
                    ? await api.tenants.findAll(token)
                    : await api.guarantors.findAll(token);

            setPeople(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // handles loading tenants for the guarantor tenant-link dropdown
    const loadTenantsForDropdown = async () => {
        if (!token) return;

        try {
            const data = await api.tenants.findAll(token);
            setTenantsList(data);
        } catch (error) {
            console.error(error);
        }
    };

    // resets page-level form state when leaving create or edit mode
    const resetForm = () => {
        setEditId(null);
        setShowForm(false);
    };

    // handles opening edit mode for one tenant or guarantor
    const handleEdit = (person: PersonRecord) => {
        setEditId(person.id);
        setShowForm(true);
    };

    // handles creating portal access for one tenant
    const handleCreateUser = async (id: string, name: string) => {
        if (!token) return;

        if (!window.confirm(`Criar acesso de usuário para "${name}"?\nIsso irá gerar uma senha temporária.`)) {
            return;
        }

        try {
            const data = await api.tenants.createUser(id, token);

            alert(
                `Usuário criado com sucesso!\nEmail: ${data.email}\nSenha Temporária: ${data.tempPassword}`,
            );
        } catch (error: any) {
            console.error(error);
            alert(`Erro: ${error?.message || 'Falha ao criar usuário'}`);
        }
    };

    // handles deleting one tenant or guarantor depending on the active tab
    const handleDelete = async (id: string, name: string) => {
        if (!token) return;

        if (!window.confirm(`Tem certeza que deseja excluir "${name}"?`)) {
            return;
        }

        try {
            if (activeTab === 'tenants') {
                await api.tenants.remove(id, token);
            } else {
                await api.guarantors.remove(id, token);
            }

            await loadPeople();
        } catch (error: any) {
            console.error(error);
            alert(error?.message || 'Erro ao excluir. Verifique se não há contratos vinculados.');
        }
    };

    // derives the current record being edited so PersonForm can stay focused on form behavior
    const editingPerson = editId ? people.find((person) => person.id === editId) : undefined;

    return (
        <div>
            {/* handles page header, tab switch, and create/cancel action */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Gestão de Pessoas</h1>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => {
                            setActiveTab('tenants');
                            resetForm();
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'tenants'
                                ? 'bg-white shadow-sm text-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Inquilinos
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('guarantors');
                            resetForm();
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'guarantors'
                                ? 'bg-white shadow-sm text-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Fiadores
                    </button>
                </div>

                <button
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                        }
                    }}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    {showForm ? 'Cancelar' : `Novo ${activeTab === 'tenants' ? 'Inquilino' : 'Fiador'}`}
                </button>
            </div>

            {/* renders the shared tenant/guarantor form with the current page context */}
            {showForm && (
                <div className="mb-8">
                    <PersonForm
                        type={activeTab === 'tenants' ? 'tenant' : 'guarantor'}
                        token={token || ''}
                        onSuccess={async () => {
                            resetForm();
                            await loadPeople();

                            if (activeTab === 'guarantors') {
                                await loadTenantsForDropdown();
                            }
                        }}
                        onCancel={resetForm}
                        initialData={editingPerson}
                        tenantsList={tenantsList}
                    />
                </div>
            )}

            {/* renders the current tenant or guarantor list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {people.map((person) => (
                    <div
                        key={person.id}
                        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 justify-between group"
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className={`p-3 rounded-full ${
                                    activeTab === 'tenants'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-purple-100 text-purple-600'
                                }`}
                            >
                                {activeTab === 'tenants' ? <User size={24} /> : <FileText size={24} />}
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-800">{person.name}</h3>
                                <p className="text-sm text-gray-500">{person.email}</p>
                                <p className="text-xs text-gray-400 mt-1">{person.document}</p>

                                {person.tenantId && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mt-2 inline-block">
                                        Fiador Vinculado
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {activeTab === 'tenants' && (
                                <button
                                    onClick={() => handleCreateUser(person.id, person.name)}
                                    className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                    title="Criar Acesso de Usuário"
                                >
                                    <Key size={18} />
                                </button>
                            )}

                            <button
                                onClick={() => handleEdit(person)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Edit size={18} />
                            </button>

                            <button
                                onClick={() => handleDelete(person.id, person.name)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* renders the empty state only after loading finishes */}
            {people.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed col-span-full">
                    <User size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Nenhum registro encontrado.</p>
                </div>
            )}
        </div>
    );
}