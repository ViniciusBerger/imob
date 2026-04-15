import React, { useState, useEffect } from 'react';
import { Plus, Home, MapPin, Building, Upload, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PropertyDetailsModal from '../components/PropertyDetailsModal';
import PersonForm from '../components/PersonForm';

interface Property {
    id: string;
    code: string;
    address: string;
    type: string;
    builtArea: number;
    landArea: number;
    bathrooms?: number;
    bedrooms?: number;
    floors?: number;
    garage?: number;
    basement?: boolean;
    purchasePrice?: number;
    rentPrice?: number;
    salePrice?: number;
    forRent: boolean;
    forSale: boolean;
    purchaseDate?: string;
    financingEndDate?: string;
    description?: string;
    nickname?: string;
    city?: string;
    state?: string;
    notes: any[]; // PropertyNote relation
    photos?: string[];
}

export default function PropertiesPage() {
    const { token } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        nickname: '',
        address: '',
        city: '',
        state: '',
        type: 'RESIDENTIAL',
        builtArea: '',
        landArea: '',
        bathrooms: '',
        bedrooms: '',
        floors: '',
        garage: '',
        basement: false,
        description: '',
        notes: '', // Initial note
        purchaseDate: '',
        purchasePrice: '',
        isFinanced: false,
        finTotal: '',
        finInstallments: '',
        finPaid: '',
        financingDueDay: '',
        financingEndDate: '',
        forRent: false,
        rentPrice: '',
        forSale: false,
        salePrice: ''
    });
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    // Contract Modal State
    const [showContractModal, setShowContractModal] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [guarantors, setGuarantors] = useState<any[]>([]);
    const [contractForm, setContractForm] = useState({
        tenantId: '',
        guarantorId: '',
        startDate: '',
        endDate: '',
        rentValue: '',
        type: 'RENT',
        autoRenew: false,
        renewalRate: '',
        rentDueDay: '',
    });
    const [showTenantForm, setShowTenantForm] = useState(false);

    useEffect(() => {
        fetchProperties();
        fetchProperties();
        fetchTenants();
        fetchGuarantors();
    }, []);

    const fetchGuarantors = async () => {
        try {
            const res = await fetch('/api/guarantors', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setGuarantors(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchTenants = async () => {
        try {
            const res = await fetch('/api/tenants', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setTenants(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchProperties = async () => {
        try {
            const res = await fetch('/api/properties', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProperties(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Convert types for API
            const payload = {
                ...formData,
                builtArea: parseFloat(formData.builtArea),
                landArea: parseFloat(formData.landArea),
                bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
                bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
                floors: formData.floors ? parseInt(formData.floors) : undefined,
                garage: formData.garage ? parseInt(formData.garage) : undefined,
                basement: Boolean(formData.basement),
                purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
                financingTotalValue: formData.finTotal ? parseFloat(formData.finTotal) : undefined,
                installmentsCount: formData.finInstallments ? parseInt(formData.finInstallments) : undefined,
                installmentsPaid: formData.finPaid ? parseInt(formData.finPaid) : undefined,
                financingDueDay: formData.financingDueDay ? parseInt(formData.financingDueDay) : undefined,
                rentPrice: formData.rentPrice ? parseFloat(formData.rentPrice) : undefined,
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
                purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
                financingEndDate: formData.financingEndDate ? new Date(formData.financingEndDate) : undefined,
            };

            const res = await fetch('/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const newProperty = await res.json();

                // Upload Photos if any
                if (selectedFiles && selectedFiles.length > 0) {
                    const data = new FormData();
                    for (let i = 0; i < selectedFiles.length; i++) {
                        data.append('files', selectedFiles[i]);
                    }
                    await fetch(`/api/properties/${newProperty.id}/photos`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: data
                    });
                }

                setShowForm(false);
                fetchProperties(); // Refresh list
                setFormData({ ...formData, code: '', address: '' }); // Reset partial
                setSelectedFiles(null);
            } else {
                alert('Erro ao criar imóvel');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Explicitly typed change handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        // Handle checkboxes safely by casting to HTMLInputElement to access 'checked'
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({ ...prev, [name]: val }));
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Meus Imóveis</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    {showForm ? 'Cancelar' : 'Novo Imóvel'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8 animate-fade-in">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Cadastro de Imóvel</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Basic Info */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600">Apelido (Nome Exibido)</label>
                            <input name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Ex: Casa Praia" className="w-full mt-1 p-2 border rounded-md" />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600">Endereço Completo</label>
                            <input name="address" value={formData.address} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 col-span-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Cidade</label>
                                <input name="city" value={formData.city} onChange={handleChange} placeholder="Ex: Capão da Canoa" className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Estado (UF)</label>
                                <input name="state" value={formData.state} onChange={handleChange} placeholder="Ex: RS" className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600">Código Interno</label>
                            <input name="code" value={formData.code} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600">Tipo</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md">
                                <option value="RESIDENTIAL">Residencial</option>
                                <option value="COMMERCIAL">Comercial</option>
                                <option value="LAND">Terreno</option>
                            </select>
                        </div>

                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Área Construída (m²)</label>
                                <input type="number" name="builtArea" value={formData.builtArea} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Área Terreno (m²)</label>
                                <input type="number" name="landArea" value={formData.landArea} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                        </div>

                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Quartos</label>
                                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Banheiros</label>
                                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Vagas</label>
                                <input type="number" name="garage" value={formData.garage} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Andares</label>
                                <input type="number" name="floors" value={formData.floors} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                        </div>

                        <div className="col-span-2 flex gap-4">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="basement" checked={Boolean(formData.basement)} onChange={handleChange} className="w-5 h-5 text-primary-600" />
                                <label className="text-sm font-medium text-gray-700">Possui Porão?</label>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600">Anotações Internas</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full mt-1 p-2 border rounded-md" placeholder="Observações..." />
                        </div>

                        {/* Financials */}
                        <div className="col-span-2 border-t pt-4 mt-2">
                            <h3 className="font-medium text-gray-800 mb-2">Financeiro & Status</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600">Valor de Compra (R$)</label>
                            <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600">Data de Compra</label>
                            <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" />
                        </div>

                        <div className="flex items-center gap-2 mt-6">
                            <input type="checkbox" name="isFinanced" checked={formData.isFinanced} onChange={handleChange} className="w-5 h-5 text-primary-600" />
                            <label className="text-sm font-medium text-gray-700">É Financiado?</label>
                        </div>

                        {formData.isFinanced && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Total Financiado (R$)</label>
                                    <input type="number" name="finTotal" value={formData.finTotal} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md bg-yellow-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Total de Parcelas</label>
                                    <input type="number" name="finInstallments" value={formData.finInstallments} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md bg-yellow-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Parcelas Pagas (Qtd)</label>
                                    <input type="number" name="finPaid" value={formData.finPaid} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md bg-yellow-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Dia Vencimento</label>
                                    <input type="number" name="financingDueDay" value={formData.financingDueDay} onChange={handleChange} min="1" max="31" className="w-full mt-1 p-2 border rounded-md bg-yellow-50" placeholder="Dia" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Data Final (Quitado)</label>
                                    <input type="date" name="financingEndDate" value={formData.financingEndDate} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md bg-yellow-50" />
                                </div>
                            </>
                        )}

                        <div className="col-span-2 flex gap-6 mt-2">
                            <div className="flex-1 p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="checkbox" name="forRent" checked={formData.forRent} onChange={handleChange} className="w-4 h-4" />
                                    <label className="font-medium">Para Alugar</label>
                                </div>
                                {formData.forRent && (
                                    <input type="number" name="rentPrice" placeholder="Valor Aluguel" value={formData.rentPrice} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                )}
                            </div>

                            <div className="flex-1 p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="checkbox" name="forSale" checked={formData.forSale} onChange={handleChange} className="w-4 h-4" />
                                    <label className="font-medium">Para Vender</label>
                                </div>
                                {formData.forSale && (
                                    <input type="number" name="salePrice" placeholder="Valor Venda" value={formData.salePrice} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                )}
                            </div>
                        </div>

                        <div className="col-span-2 mt-4">
                            <label className="block text-sm font-medium text-gray-600 mb-2">Fotos do Imóvel</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setSelectedFiles(e.target.files)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">{selectedFiles ? `${selectedFiles.length} arquivos selecionados` : 'Clique ou arraste fotos aqui'}</p>
                            </div>
                        </div>

                        <div className="col-span-2 mt-4">
                            <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-bold">
                                {loading ? 'Salvando...' : 'Cadastrar Imóvel'}
                            </button>
                        </div>
                    </form>
                </div>
            )
            }


            {/* Contract Modal */}
            {
                showContractModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Novo Contrato</h2>
                            <div className="space-y-4">
                                {/* Type Selection */}
                                <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                                    <button
                                        onClick={() => setContractForm({ ...contractForm, type: 'RENT' })}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${contractForm.type === 'RENT' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                    >
                                        Aluguel
                                    </button>
                                    <button
                                        onClick={() => setContractForm({ ...contractForm, type: 'SALE' })}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${contractForm.type === 'SALE' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
                                    >
                                        Venda
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Inquilino / Comprador</label>
                                        <div className="flex gap-2">
                                            <select
                                                className="w-full border p-2 rounded-lg mt-1"
                                                value={contractForm.tenantId}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setContractForm({ ...contractForm, tenantId: e.target.value })}
                                            >
                                                <option value="">Selecione...</option>
                                                {tenants.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name} ({t.document})</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => setShowTenantForm(true)}
                                                className="mt-1 bg-gray-100 p-2 rounded-lg text-primary-600 hover:bg-gray-200"
                                                title="Novo Inquilino"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {contractForm.type === 'RENT' && (
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Fiador (Opcional)</label>
                                            <select
                                                className="w-full border p-2 rounded-lg mt-1"
                                                value={contractForm.guarantorId}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setContractForm({ ...contractForm, guarantorId: e.target.value })}
                                            >
                                                <option value="">Selecione...</option>
                                                {guarantors.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name} ({g.document})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Início</label>
                                        <input type="date" className="w-full border p-2 rounded-lg mt-1"
                                            value={contractForm.startDate}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContractForm({ ...contractForm, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Fim</label>
                                        <input type="date" className="w-full border p-2 rounded-lg mt-1"
                                            value={contractForm.endDate}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContractForm({ ...contractForm, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Valor {contractForm.type === 'RENT' ? 'Aluguel' : 'Venda'} (R$)</label>
                                    <input type="number" className="w-full border p-2 rounded-lg mt-1"
                                        value={contractForm.rentValue}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContractForm({ ...contractForm, rentValue: e.target.value })}
                                    />
                                </div>

                                {contractForm.type === 'RENT' && (
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-primary-600"
                                                checked={contractForm.autoRenew}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContractForm({ ...contractForm, autoRenew: e.target.checked })}
                                            />
                                            <label className="text-sm font-medium text-gray-700">Renovação Automática?</label>
                                        </div>
                                        {contractForm.autoRenew && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Taxa de Renovação (%)</label>
                                                <input type="number" className="w-full border p-1 rounded mt-1 text-sm"
                                                    value={contractForm.renewalRate}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContractForm({ ...contractForm, renewalRate: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2 mt-6">
                                    <button onClick={() => setShowContractModal(false)} className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-gray-200">Cancelar</button>
                                    <button
                                        onClick={async () => {
                                            if (!selectedPropertyId || !contractForm.tenantId) return;
                                            try {
                                                const payload: any = {
                                                    ...contractForm,
                                                    propertyId: selectedPropertyId,
                                                    rentValue: parseFloat(contractForm.rentValue),
                                                    startDate: new Date(contractForm.startDate).toISOString(),
                                                    endDate: new Date(contractForm.endDate).toISOString(),
                                                    adjustmentRate: contractForm.renewalRate ? parseFloat(contractForm.renewalRate) : undefined,
                                                    rentDueDay: contractForm.rentDueDay ? parseInt(contractForm.rentDueDay) : undefined,
                                                };
                                                // Handle optional guarantor (send undefined if empty string)
                                                if (!contractForm.guarantorId) delete payload.guarantorId;

                                                // Remove frontend-only fields not in DTO
                                                delete payload.renewalRate;

                                                const res = await fetch('/api/leases', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${token}`
                                                    },
                                                    body: JSON.stringify(payload)
                                                });
                                                if (res.ok) {
                                                    setShowContractModal(false);
                                                    alert('Contrato criado com sucesso!');
                                                } else {
                                                    const err = await res.json();
                                                    alert(`Erro ao criar contrato: ${err.message || 'Erro desconhecido'}`);
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert('Erro de conexão ao criar contrato');
                                            }
                                        }}
                                        className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 font-bold"
                                    >
                                        Criar Contrato
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Tenant Creation Modal */}
            {
                showTenantForm && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
                        <div className="w-full max-w-lg">
                            <PersonForm
                                type="tenant"
                                token={token || ''}
                                onSuccess={(newTenant: any) => {
                                    setTenants([...tenants, newTenant]);
                                    setContractForm({ ...contractForm, tenantId: newTenant.id });
                                    setShowTenantForm(false);
                                }}
                                onCancel={() => setShowTenantForm(false)}
                            />
                        </div>
                    </div>
                )
            }

            {/* List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {properties.map((p) => (
                    <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">{p.type}</span>
                                <span className="text-gray-400 text-sm">#{p.code}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <MapPin size={18} className="text-gray-400" />
                                {p.nickname || p.address}
                            </h3>
                            <div className="flex gap-4 mt-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Building size={16} /> {p.builtArea}m² (C) / {p.landArea}m² (T)</span>
                                {p.bedrooms && <span className="flex items-center gap-1">{p.bedrooms} Quartos</span>}
                                {p.bathrooms && <span className="flex items-center gap-1">🛁 {p.bathrooms} Ban</span>}
                            </div>
                            {p.city && <p className="text-xs text-gray-400 mt-1">{p.city} - {p.state}</p>}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                            <div className="flex gap-2">
                                {p.forRent && <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded">Aluguel: R$ {Number(p.rentPrice).toLocaleString('pt-BR')}</span>}
                                {p.forSale && <span className="text-orange-600 font-medium text-sm bg-orange-50 px-2 py-1 rounded">Venda: R$ {Number(p.salePrice).toLocaleString('pt-BR')}</span>}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        setSelectedPropertyId(p.id);
                                        setShowContractModal(true);
                                    }}
                                    className="text-primary-600 font-medium text-sm hover:underline flex items-center gap-1"
                                >
                                    <FileText size={16} /> Contrato
                                </button>
                                <button
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        setSelectedPropertyId(p.id);
                                    }}
                                    className="text-gray-600 font-medium text-sm hover:underline"
                                >
                                    Detalhes
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {properties.length === 0 && !loading && (
                    <div className="col-span-2 text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                        <Home size={48} className="mx-auto mb-3 opacity-20" />
                        <p>Nenhum imóvel cadastrado ainda.</p>
                    </div>
                )}

            </div>

            {/* Details Modal */}
            {
                selectedPropertyId && !showContractModal && !showForm && (
                    <PropertyDetailsModal
                        propertyId={selectedPropertyId}
                        onClose={() => setSelectedPropertyId(null)}
                        token={token || ''}
                        onUpdate={fetchProperties}
                    />
                )
            }
        </div >
    );
}
