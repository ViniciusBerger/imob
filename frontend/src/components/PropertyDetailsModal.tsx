import React, { useState, useEffect, useRef } from 'react';
import { X, Edit2, Trash2, MapPin, Building, Key, DollarSign, FileText, Settings, Save, StickyNote, Send, Paperclip, Wrench, Download, Plus, CheckCircle, AlertTriangle, UploadCloud, Upload } from 'lucide-react';
import { api, Property } from '../api';

interface PropertyDetailsModalProps {
    propertyId: string;
    onClose: () => void;
    token: string;
    onUpdate: () => void;
}

export default function PropertyDetailsModal({ propertyId, onClose, token, onUpdate }: PropertyDetailsModalProps) {
    const [activeTab, setActiveTab] = useState('info');
    const [property, setProperty] = useState<Property | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Chat State
    const [noteContent, setNoteContent] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // New Data States
    const [newExpense, setNewExpense] = useState({ name: '', value: '', frequency: 'MONTHLY' });
    const [newMaintenance, setNewMaintenance] = useState({ description: '', cost: '', date: '', status: 'PENDING' });
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    useEffect(() => {
        fetchProperty();
    }, [propertyId]);

    useEffect(() => {
        // Scroll to bottom of chat
        if (activeTab) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [property?.notes, activeTab]);

    const fetchProperty = async () => {
        try {
            const data = await api.properties.findOne(propertyId, token);
            setProperty(data);
            setFormData(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.properties.update(propertyId, formData, token);
            await fetchProperty();
            setEditMode(false);
            onUpdate();
            alert('Imóvel atualizado com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar imóvel');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja EXCLUIR este imóvel? Esta ação é irreversível.')) return;
        try {
            await api.properties.delete(propertyId, token);
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir imóvel');
        }
    };

    const handleAddNote = async () => {
        if (!noteContent.trim()) return;
        try {
            const userStr = sessionStorage.getItem('user');
            const userId = userStr ? JSON.parse(userStr).id : null;
            if (!userId) return;

            await api.properties.addNote(propertyId, noteContent, userId, token);
            await fetchProperty();
            setNoteContent('');
        } catch (e) { console.error(e); }
    };

    const handleAddExpense = async () => {
        try {
            // Check specific endpoint or generic update
            // For now using generic update if specific doesn't exist, but controller usually has specific
            // Actually controller had addExpense
            const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/properties/${propertyId}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...newExpense, value: parseFloat(newExpense.value) })
            });
            if (res.ok) {
                await fetchProperty();
                setNewExpense({ name: '', value: '', frequency: 'MONTHLY' });
            }
        } catch (e) { console.error(e); }
    };

    const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        try {
            await api.properties.uploadDocument(propertyId, file, file.name, token);
            await fetchProperty();
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar documento');
        }
    };

    const handleAddMaintenance = async () => {
        try {
            await api.maintenance.create({
                ...newMaintenance,
                propertyId,
                cost: parseFloat(newMaintenance.cost),
                date: new Date(newMaintenance.date)
            }, token);
            await fetchProperty();
            setMaintenanceMode(false);
            setNewMaintenance({ description: '', cost: '', date: '', status: 'PENDING' });
        } catch (error) {
            console.error(error);
            alert('Erro ao criar manutenção');
        }
    };

    const handlePayInvoice = async (invoiceId: string) => {
        if (!confirm("Confirmar pagamento deste aluguel?")) return;
        try {
            // Updated to allow invoice updates
            await api.finance.updateInvoice(invoiceId, { status: 'PAID', paidAt: new Date() }, token);
            await fetchProperty();
            alert("Aluguel quitado!");
        } catch (error) {
            console.error(error);
            alert("Erro ao quitar aluguel");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev: any) => ({ ...prev, [name]: val }));
    };

    if (!property) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">

                {/* Header */}
                <div className="bg-white border-b px-6 py-4 flex justify-between items-center shrink-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {property.nickname || property.address}
                            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">#{property.code}</span>
                        </h2>
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                            <MapPin size={12} /> {property.city} - {property.state}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT COLUMN: Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
                        {/* Tabs Navigation */}
                        <div className="flex border-b bg-white px-4 shrink-0 overflow-x-auto">
                            {[
                                { id: 'info', label: 'Detalhes', icon: Building },
                                { id: 'finance', label: 'Financeiro', icon: DollarSign },
                                { id: 'contracts', label: 'Contratos', icon: Key },
                                { id: 'documents', label: 'Documentos', icon: FileText },
                                { id: 'maintenance', label: 'Manutenção', icon: Wrench },
                                { id: 'settings', label: 'Config', icon: Settings },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <tab.icon size={16} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6">

                            {/* INFO TAB */}
                            {activeTab === 'info' && (
                                <div className="space-y-6 max-w-4xl mx-auto">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-700">Dados do Imóvel</h3>
                                        <button onClick={() => editMode ? handleSave() : setEditMode(true)} className={`text-xs px-3 py-1.5 rounded font-bold flex items-center gap-1 ${editMode ? 'bg-green-600 text-white' : 'bg-primary-50 text-primary-600'}`}>
                                            {editMode ? <><Save size={14} /> Salvar</> : <><Edit2 size={14} /> Editar</>}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded border">
                                            <label className="label-tiny">Endereço</label>
                                            <input disabled={!editMode} name="address" value={formData.address} onChange={handleChange} className="input-clean" />
                                        </div>
                                        <div className="bg-white p-4 rounded border">
                                            <label className="label-tiny">Apelido</label>
                                            <input disabled={!editMode} name="nickname" value={formData.nickname} onChange={handleChange} className="input-clean" />
                                        </div>
                                        <div className="bg-white p-4 rounded border grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="label-tiny">Área Útil</label>
                                                <input disabled={!editMode} name="builtArea" value={formData.builtArea} onChange={handleChange} className="input-clean" />
                                            </div>
                                            <div>
                                                <label className="label-tiny">Área Total</label>
                                                <input disabled={!editMode} name="landArea" value={formData.landArea} onChange={handleChange} className="input-clean" />
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded border grid grid-cols-3 gap-2">
                                            <div><label className="label-tiny">Quartos</label><input disabled={!editMode} name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="input-clean" /></div>
                                            <div><label className="label-tiny">Banhos</label><input disabled={!editMode} name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="input-clean" /></div>
                                            <div><label className="label-tiny">Vagas</label><input disabled={!editMode} name="garage" value={formData.garage} onChange={handleChange} className="input-clean" /></div>
                                        </div>
                                    </div>
                                    {/* Photos */}
                                    <div>
                                        <label className="label-tiny mb-2 block">Galeria</label>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {property.photos?.map((src: string, i: number) => {
                                                const fullSrc = src.startsWith('http') ? src : `${(import.meta.env.VITE_API_URL || '/api').replace('/api', '')}${src}`;
                                                return <img key={i} src={fullSrc} className="h-32 w-48 object-cover rounded-lg border" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FINANCE TAB */}
                            {activeTab === 'finance' && (
                                <div className="space-y-6 max-w-4xl mx-auto">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white p-5 rounded-xl border shadow-sm">
                                            <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Valores</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Aluguel Base</span>
                                                    <input disabled={!editMode} name="rentPrice" value={formData.rentPrice} onChange={handleChange} className="text-right font-mono font-bold text-gray-800 w-32 input-clean" />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Valor Venda</span>
                                                    <input disabled={!editMode} name="salePrice" value={formData.salePrice} onChange={handleChange} className="text-right font-mono font-bold text-gray-800 w-32 input-clean" />
                                                </div>
                                                <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed">
                                                    <span className="text-sm text-gray-500">Valor Compra</span>
                                                    <input disabled={!editMode} name="purchasePrice" type="number" value={formData.purchasePrice} onChange={handleChange} className="text-right font-mono text-gray-400 w-32 input-clean" placeholder="0.00" />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Data Compra</span>
                                                    <input disabled={!editMode} name="purchaseDate" type="date" value={formData.purchaseDate ? new Date(formData.purchaseDate).toISOString().split('T')[0] : ''} onChange={handleChange} className="text-right font-mono text-gray-400 w-32 input-clean" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-5 rounded-xl border shadow-sm col-span-2 md:col-span-1">
                                            <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Detalhes do Financiamento</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-tiny">Tipo Financ.</label>
                                                    <select disabled={!editMode} name="financingType" value={formData.financingType || ''} onChange={handleChange as any} className="input-clean bg-transparent w-full">
                                                        <option value="">Nenhum/À Vista</option>
                                                        <option value="PRICE">Tabela Price</option>
                                                        <option value="SAC">Tabela SAC</option>
                                                        <option value="DIRECT">Direto c/ Prop.</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="label-tiny">Fim Financ.</label>
                                                    <input disabled={!editMode} name="financingEndDate" type="date" value={formData.financingEndDate ? new Date(formData.financingEndDate).toISOString().split('T')[0] : ''} onChange={handleChange} className="input-clean" />
                                                </div>
                                                <div>
                                                    <label className="label-tiny">Valor Parcela</label>
                                                    <input disabled={!editMode} name="installmentValue" type="number" value={formData.installmentValue} onChange={handleChange} className="input-clean" placeholder="0.00" />
                                                </div>
                                                <div>
                                                    <label className="label-tiny">Total Financiado</label>
                                                    <input disabled={!editMode} name="financingTotalValue" type="number" value={formData.financingTotalValue} onChange={handleChange} className="input-clean" placeholder="0.00" />
                                                </div>
                                                <div>
                                                    <label className="label-tiny">Parcelas (Total)</label>
                                                    <input disabled={!editMode} name="installmentsCount" type="number" value={formData.installmentsCount} onChange={handleChange} className="input-clean" placeholder="0" />
                                                </div>
                                                <div>
                                                    <label className="label-tiny">Parcelas (Pagas)</label>
                                                    <input disabled={!editMode} name="installmentsPaid" type="number" value={formData.installmentsPaid} onChange={handleChange} className="input-clean" placeholder="0" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="label-tiny">Índice Correção</label>
                                                    <input disabled={!editMode} name="correctionIndex" value={formData.correctionIndex} onChange={handleChange} className="input-clean" placeholder="Ex: IPCA + 0.5%" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-5 rounded-xl border shadow-sm col-span-2">
                                            <h4 className="font-bold text-gray-700 mb-4 border-b pb-2 flex justify-between items-center">
                                                <span>Custos Fixos da Propriedade</span>
                                                <button onClick={() => setNewExpense({ ...newExpense, name: '', value: '', frequency: 'MONTHLY' })} className="text-xs font-normal text-primary-600 hover:underline">
                                                    Limpar
                                                </button>
                                            </h4>

                                            {/* List of Existing Costs */}
                                            <div className="space-y-2 mb-6">
                                                {property.propertyExpenses?.map((e: any) => (
                                                    <div key={e.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-white p-2 rounded-full border text-gray-500">
                                                                <DollarSign size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-800">{e.name}</p>
                                                                <p className="text-xs text-gray-500 flex gap-2">
                                                                    <span>{e.frequency === 'MONTHLY' ? 'Mensal' : e.frequency === 'YEARLY' ? 'Anual' : 'Único'}</span>
                                                                    {e.dueDateDay && <span>• Dia {e.dueDateDay}</span>}
                                                                    {e.autoGenerate && <span className="text-green-600">• Gera Fatura Auto</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="font-mono font-bold text-gray-700">R$ {Number(e.value).toFixed(2)}</span>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!confirm('Remover este custo fixo?')) return;
                                                                    try {
                                                                        await api.properties.removePropertyExpense(e.id, token);
                                                                        fetchProperty();
                                                                    } catch (err) { console.error(err); alert('Erro ao remover custo.'); }
                                                                }}
                                                                className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!property.propertyExpenses || property.propertyExpenses.length === 0) && (
                                                    <div className="text-center text-gray-400 text-xs py-4 italic">Nenhum custo fixo cadastrado.</div>
                                                )}
                                            </div>

                                            {/* Add New Cost Form */}
                                            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                                                <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">Adicionar Novo Custo</h5>
                                                <div className="grid grid-cols-12 gap-3 items-end">
                                                    <div className="col-span-4">
                                                        <label className="label-tiny">Nome</label>
                                                        <input placeholder="Ex: Condomínio" className="input-tiny w-full bg-white border-gray-300" value={newExpense.name} onChange={e => setNewExpense({ ...newExpense, name: e.target.value })} />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <label className="label-tiny">Valor</label>
                                                        <input placeholder="0,00" type="number" className="input-tiny w-full bg-white border-gray-300" value={newExpense.value} onChange={e => setNewExpense({ ...newExpense, value: e.target.value })} />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <label className="label-tiny">Frequência</label>
                                                        <select className="input-tiny w-full bg-white border-gray-300" value={newExpense.frequency} onChange={e => setNewExpense({ ...newExpense, frequency: e.target.value as any })}>
                                                            <option value="MONTHLY">Mensal</option>
                                                            <option value="YEARLY">Anual</option>
                                                            <option value="ONCE">Único</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <button onClick={async () => {
                                                            if (!newExpense.name || !newExpense.value) return;
                                                            try {
                                                                await api.properties.addPropertyExpense(propertyId, {
                                                                    ...newExpense,
                                                                    value: parseFloat(newExpense.value),
                                                                    autoGenerate: true // Default to true for now
                                                                }, token);
                                                                setNewExpense({ name: '', value: '', frequency: 'MONTHLY' });
                                                                fetchProperty();
                                                            } catch (err) { console.error(err); alert('Erro ao adicionar custo.'); }
                                                        }} className="btn-tiny bg-gray-900 text-white w-full h-[26px] flex items-center justify-center gap-1">
                                                            <Plus size={12} /> Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DOCUMENTS TAB */}
                            {activeTab === 'documents' && (
                                <div className="max-w-4xl mx-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-gray-700">Documentação</h3>
                                        <label className="cursor-pointer bg-primary-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-primary-700 flex items-center gap-2">
                                            <UploadCloud size={16} /> Upload
                                            <input type="file" className="hidden" onChange={handleUploadDocument} />
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {property.documents?.map((doc: any) => (
                                            <div key={doc.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-50 p-2 rounded text-blue-600"><FileText size={20} /></div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{doc.title}</p>
                                                        <p className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <a href={doc.filePath} download className="text-gray-400 hover:text-primary-600 p-2"><Download size={18} /></a>
                                            </div>
                                        ))}
                                        {(!property.documents || property.documents.length === 0) && (
                                            <div className="col-span-2 py-12 text-center text-gray-400 border-2 border-dashed rounded-lg">
                                                Nenhum documento anexado.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* MAINTENANCE TAB */}
                            {activeTab === 'maintenance' && (
                                <div className="max-w-4xl mx-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-gray-700">Manutenção & Reparos</h3>
                                        <button onClick={() => setMaintenanceMode(!maintenanceMode)} className="bg-primary-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-primary-700 flex items-center gap-2">
                                            <Plus size={16} /> Nova Manutenção
                                        </button>
                                    </div>

                                    {maintenanceMode && (
                                        <div className="bg-gray-50 border p-4 rounded-lg mb-6 animate-fade-in">
                                            <h4 className="font-bold text-sm mb-3">Registrar Manutenção</h4>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="col-span-2">
                                                    <label className="label-tiny">Descrição</label>
                                                    <input value={newMaintenance.description} onChange={e => setNewMaintenance({ ...newMaintenance, description: e.target.value })} className="input-clean bg-white border" placeholder="O que precisa ser feito?" />
                                                </div>
                                                <div>
                                                    <label className="label-tiny">Custo Estimado (R$)</label>
                                                    <input type="number" value={newMaintenance.cost} onChange={e => setNewMaintenance({ ...newMaintenance, cost: e.target.value })} className="input-clean bg-white border" placeholder="0,00" />
                                                </div>
                                                <div>
                                                    <label className="label-tiny">Data Prevista</label>
                                                    <input type="date" value={newMaintenance.date} onChange={e => setNewMaintenance({ ...newMaintenance, date: e.target.value })} className="input-clean bg-white border" />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setMaintenanceMode(false)} className="text-sm text-gray-500 hover:underline px-3">Cancelar</button>
                                                <button onClick={handleAddMaintenance} className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-green-700">Salvar</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {property.maintenances?.map((m: any) => (
                                            <div key={m.id} className="bg-white p-4 rounded-lg border hover:border-gray-300 transition-colors flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-full ${m.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                        {m.status === 'COMPLETED' ? <CheckCircle size={20} /> : <Wrench size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800">{m.description}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(m.date).toLocaleDateString()} • Custo: R$ {Number(m.cost).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        m.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {m.status === 'COMPLETED' ? 'Concluída' : m.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Pendente'}
                                                    </span>
                                                    {m.status !== 'COMPLETED' && (
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('Marcar manutenção como concluída?')) return;
                                                                const createInvoice = confirm('Gerar fatura de despesa para este custo?');
                                                                try {
                                                                    await api.maintenance.complete(m.id, createInvoice, token);
                                                                    await fetchProperty();
                                                                } catch (e) {
                                                                    console.error(e);
                                                                    alert('Erro ao concluir manutenção.');
                                                                }
                                                            }}
                                                            className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 font-bold border border-green-200"
                                                        >
                                                            Concluir
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CONTRACTS TAB + RENT PAYMENT */}
                            {activeTab === 'contracts' && (
                                <div className="max-w-4xl mx-auto space-y-6">
                                    {property.leases?.map((lease: any) => (
                                        <div key={lease.id} className="bg-white border rounded-xl p-5 shadow-sm">
                                            <div className="flex justify-between items-start mb-4 border-b pb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-800">{lease.tenant?.name || 'Inquilino'}</h4>
                                                    <p className="text-sm text-gray-500">CPF: {lease.tenant?.document}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${lease.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {lease.isActive ? 'Ativo' : 'Finalizado'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 text-sm mb-6">
                                                <div><span className="block text-gray-500 text-xs">Início</span> {new Date(lease.startDate).toLocaleDateString()}</div>
                                                <div><span className="block text-gray-500 text-xs">Fim</span> {new Date(lease.endDate).toLocaleDateString()}</div>
                                                <div><span className="block text-gray-500 text-xs">Valor</span> <strong>R$ {Number(lease.rentValue).toLocaleString('pt-BR')}</strong></div>
                                                <div><span className="block text-gray-500 text-xs">Renovação</span> {lease.autoRenew ? 'Sim' : 'Não'}</div>
                                            </div>

                                            {/* Invoices / Rent Payment */}
                                            {lease.invoices && lease.invoices.length > 0 && (
                                                <div className="mt-4">
                                                    <h5 className="font-bold text-sm text-gray-600 mb-2">Histórico de Aluguéis</h5>
                                                    <div className="space-y-2">
                                                        {lease.invoices.filter((inv: any) => inv.type === 'RENT').map((inv: any) => (
                                                            <div key={inv.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                                                <span className="text-gray-600">{new Date(inv.dueDate).toLocaleDateString()} - {inv.description}</span>
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`font-mono ${inv.status === 'PAID' ? 'text-green-600' : 'text-red-500'}`}>
                                                                        R$ {Number(inv.amount).toLocaleString('pt-BR')}
                                                                    </span>
                                                                    {inv.status !== 'PAID' && (
                                                                        <button
                                                                            onClick={() => handlePayInvoice(inv.id)}
                                                                            className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold hover:bg-green-200"
                                                                        >
                                                                            Quitar
                                                                        </button>
                                                                    )}
                                                                    {inv.status === 'PAID' && (
                                                                        <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                                                            <CheckCircle size={12} /> Pago
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!property.leases || property.leases.length === 0) && (
                                        <div className="text-center py-12 text-gray-400">Nenhum contrato ativo.</div>
                                    )}
                                </div>
                            )}

                            {/* SETTINGS TAB */}
                            {activeTab === 'settings' && (
                                <div className="max-w-4xl mx-auto pt-8">
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                        <h3 className="text-red-800 font-bold mb-2">Zona de Perigo</h3>
                                        <p className="text-red-600 text-sm mb-4">Ações aqui são irreversíveis.</p>
                                        <button onClick={handleDelete} className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors">
                                            Excluir Imóvel
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* RIGHT COLUMN: Chat / Timeline */}
                    <div className="w-1/3 min-w-[320px] max-w-[400px] border-l bg-white flex flex-col h-full z-20 shadow-lg">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <StickyNote size={18} /> Chat do Imóvel
                            </h3>
                            <span className="text-xs text-gray-400">{property.notes?.length || 0} msgs</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                            {property.notes?.map((note: any) => {
                                const userStr = sessionStorage.getItem('user');
                                const currentUserId = userStr ? JSON.parse(userStr).id : null;
                                const isMe = note.userId === currentUserId;

                                return (
                                    <div key={note.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm text-sm ${isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                                            <p>{note.content}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'opacity-70' : 'text-gray-400'}`}>
                                                {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 border-t bg-white">
                            <div className="flex gap-2 items-center bg-gray-100 rounded-full px-4 py-2">
                                <input
                                    className="flex-1 bg-transparent border-none outline-none text-sm"
                                    placeholder="Digite uma mensagem..."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                    autoFocus
                                />
                                <button onClick={handleAddNote} className="text-primary-600 hover:text-primary-800 transition-colors p-1">
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            <style>{`
                .label-tiny { @apply block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1; }
                .input-clean { @apply w-full p-0 border-b border-transparent hover:border-gray-200 focus:border-primary-500 focus:ring-0 text-sm bg-transparent transition-colors outline-none; }
                .input-tiny { @apply border rounded px-2 py-1 text-xs outline-none focus:border-primary-500; }
                .btn-tiny { @apply rounded px-2 py-1 text-xs font-bold transition-transform active:scale-95; }
            `}</style>
        </div >
    );
}
