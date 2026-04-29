import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Building, FileText, Home, MapPin, Plus, Upload } from 'lucide-react';
import { api } from '../api';
import PropertyDetailsModal from '../components/PropertyDetailsModal';
import PersonForm from '../components/PersonForm';
import { useAuth } from '../contexts/AuthContext';

// represents one property card rendered on the page
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
    notes: unknown[];
    photos?: string[];
}

// represents one tenant or guarantor option used in dropdowns
interface PersonOption {
    id: string;
    name: string;
    document: string;
}

// represents the local property create form state
interface PropertyFormData {
    code: string;
    nickname: string;
    address: string;
    city: string;
    state: string;
    type: 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND';
    builtArea: string;
    landArea: string;
    bathrooms: string;
    bedrooms: string;
    floors: string;
    garage: string;
    basement: boolean;
    description: string;
    notes: string;
    purchaseDate: string;
    purchasePrice: string;
    isFinanced: boolean;
    finTotal: string;
    finInstallments: string;
    finPaid: string;
    financingDueDay: string;
    financingEndDate: string;
    forRent: boolean;
    rentPrice: string;
    forSale: boolean;
    salePrice: string;
}

// represents the local contract create form state
interface ContractFormData {
    tenantId: string;
    guarantorId: string;
    startDate: string;
    endDate: string;
    rentValue: string;
    type: 'RENT' | 'SALE';
    autoRenew: boolean;
    renewalRate: string;
    rentDueDay: string;
}

// keeps the empty property form state in one place
const EMPTY_PROPERTY_FORM: PropertyFormData = {
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
    notes: '',
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
    salePrice: '',
};

// keeps the empty contract form state in one place
const EMPTY_CONTRACT_FORM: ContractFormData = {
    tenantId: '',
    guarantorId: '',
    startDate: '',
    endDate: '',
    rentValue: '',
    type: 'RENT',
    autoRenew: false,
    renewalRate: '',
    rentDueDay: '',
};

// handles mapping the page form state into the property create payload
function buildPropertyCreatePayload(formData: PropertyFormData) {
    return {
        code: formData.code,
        address: formData.address,
        type: formData.type,
        builtArea: parseFloat(formData.builtArea),
        landArea: parseFloat(formData.landArea),
        basement: Boolean(formData.basement),
        isFinanced: formData.isFinanced,
        forRent: formData.forRent,
        forSale: formData.forSale,
        ...(formData.nickname ? { nickname: formData.nickname } : {}),
        ...(formData.city ? { city: formData.city } : {}),
        ...(formData.state ? { state: formData.state } : {}),
        ...(formData.description ? { description: formData.description } : {}),
        ...(formData.bathrooms ? { bathrooms: parseInt(formData.bathrooms, 10) } : {}),
        ...(formData.bedrooms ? { bedrooms: parseInt(formData.bedrooms, 10) } : {}),
        ...(formData.floors ? { floors: parseInt(formData.floors, 10) } : {}),
        ...(formData.garage ? { garage: parseInt(formData.garage, 10) } : {}),
        ...(formData.purchasePrice ? { purchasePrice: parseFloat(formData.purchasePrice) } : {}),
        ...(formData.purchaseDate ? { purchaseDate: new Date(formData.purchaseDate) } : {}),
        ...(formData.finTotal ? { financingTotalValue: parseFloat(formData.finTotal) } : {}),
        ...(formData.finInstallments ? { installmentsCount: parseInt(formData.finInstallments, 10) } : {}),
        ...(formData.finPaid ? { installmentsPaid: parseInt(formData.finPaid, 10) } : {}),
        ...(formData.financingDueDay ? { financingDueDay: parseInt(formData.financingDueDay, 10) } : {}),
        ...(formData.financingEndDate ? { financingEndDate: new Date(formData.financingEndDate) } : {}),
        ...(formData.rentPrice ? { rentPrice: parseFloat(formData.rentPrice) } : {}),
        ...(formData.salePrice ? { salePrice: parseFloat(formData.salePrice) } : {}),
    };
}

// handles mapping the page contract form state into the lease create payload
function buildLeaseCreatePayload(contractForm: ContractFormData, propertyId: string) {
    return {
        propertyId,
        tenantId: contractForm.tenantId,
        startDate: new Date(contractForm.startDate).toISOString(),
        endDate: new Date(contractForm.endDate).toISOString(),
        rentValue: parseFloat(contractForm.rentValue),
        type: contractForm.type,
        autoRenew: contractForm.autoRenew,
        ...(contractForm.guarantorId ? { guarantorId: contractForm.guarantorId } : {}),
        ...(contractForm.renewalRate ? { adjustmentRate: parseFloat(contractForm.renewalRate) } : {}),
        ...(contractForm.rentDueDay ? { rentDueDay: parseInt(contractForm.rentDueDay, 10) } : {}),
    };
}

export default function PropertiesPage() {
    const { token } = useAuth();

    const [properties, setProperties] = useState<Property[]>([]);
    const [tenants, setTenants] = useState<PersonOption[]>([]);
    const [guarantors, setGuarantors] = useState<PersonOption[]>([]);

    const [showForm, setShowForm] = useState(false);
    const [showTenantForm, setShowTenantForm] = useState(false);

    const [detailsPropertyId, setDetailsPropertyId] = useState<string | null>(null);
    const [contractPropertyId, setContractPropertyId] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    const [formData, setFormData] = useState<PropertyFormData>(EMPTY_PROPERTY_FORM);
    const [contractForm, setContractForm] = useState<ContractFormData>(EMPTY_CONTRACT_FORM);

    // handles loading all initial data needed by the page
    useEffect(() => {
        if (!token) return;
        void loadInitialData();
    }, [token]);

    // handles loading properties, tenants, and guarantors for the page
    const loadInitialData = async () => {
        if (!token) return;

        setLoading(true);

        try {
            const [propertiesData, tenantsData, guarantorsData] = await Promise.all([
                api.properties.findAll(),
                api.tenants.findAll(token),
                api.guarantors.findAll(token),
            ]) as [Property[], PersonOption[], PersonOption[]];;

            setProperties(propertiesData);
            setTenants(tenantsData);
            setGuarantors(guarantorsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // handles refreshing only the property list after property mutations
    const fetchProperties = async () => {
        try {
            const data = await api.properties.findAll() as Property[];
            setProperties(data);
        } catch (error) {
            console.error(error);
        }
    };

    // resets the property create form after success or cancel
    const resetPropertyForm = () => {
        setFormData(EMPTY_PROPERTY_FORM);
        setSelectedFiles(null);
        setShowForm(false);
    };

    // resets the contract modal state after success or cancel
    const resetContractForm = () => {
        setContractForm(EMPTY_CONTRACT_FORM);
        setContractPropertyId(null);
    };

    // handles updating local property create form state
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const nextValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData((prev) => ({
            ...prev,
            [name]: nextValue,
        }));
    };

    // handles creating one property and its optional follow-up actions
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setLoading(true);

        try {
            const payload = buildPropertyCreatePayload(formData);
            const newProperty = (await api.properties.create(payload, token)) as { id: string };

            // handles uploading property photos after the property exists
            if (selectedFiles && selectedFiles.length > 0) {
                await api.properties.uploadPhotos(newProperty.id, selectedFiles, token);
            }

            // handles creating the initial internal property note after the property exists
            if (formData.notes.trim()) {
                await api.properties.addNote(newProperty.id, formData.notes.trim(), token);
            }

            await fetchProperties();
            resetPropertyForm();
        } catch (error) {
            console.error(error);
            alert('Erro ao criar imóvel');
        } finally {
            setLoading(false);
        }
    };

    // handles opening the contract modal for one selected property
    const handleOpenContractModal = (propertyId: string) => {
        setContractForm(EMPTY_CONTRACT_FORM);
        setContractPropertyId(propertyId);
    };

    // handles creating one contract for the selected property
    const handleCreateContract = async () => {
        if (!token || !contractPropertyId || !contractForm.tenantId) return;

        try {
            const payload = buildLeaseCreatePayload(contractForm, contractPropertyId);
            await api.leases.create(payload, token);
            resetContractForm();
            alert('Contrato criado com sucesso!');
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao criar contrato: ${error?.message || 'Erro desconhecido'}`);
        }
    };

    return (
        <div>
            {/* handles page header and property create toggle */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Meus Imóveis</h1>
                <button
                    onClick={() => {
                        if (showForm) {
                            resetPropertyForm();
                        } else {
                            setShowForm(true);
                        }
                    }}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    {showForm ? 'Cancelar' : 'Novo Imóvel'}
                </button>
            </div>

            {/* handles the property create form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8 animate-fade-in">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Cadastro de Imóvel</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600">
                                Apelido (Nome Exibido)
                            </label>
                            <input
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                placeholder="Ex: Casa Praia"
                                className="w-full mt-1 p-2 border rounded-md"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600">
                                Endereço Completo
                            </label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="w-full mt-1 p-2 border rounded-md"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 col-span-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Cidade</label>
                                <input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Ex: Capão da Canoa"
                                    className="w-full mt-1 p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Estado (UF)</label>
                                <input
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Ex: RS"
                                    className="w-full mt-1 p-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600">Código Interno</label>
                            <input
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                                className="w-full mt-1 p-2 border rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600">Tipo</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border rounded-md"
                            >
                                <option value="RESIDENTIAL">Residencial</option>
                                <option value="COMMERCIAL">Comercial</option>
                                <option value="LAND">Terreno</option>
                            </select>
                        </div>

                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Área Construída (m²)
                                </label>
                                <input
                                    type="number"
                                    name="builtArea"
                                    value={formData.builtArea}
                                    onChange={handleChange}
                                    required
                                    className="w-full mt-1 p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Área Terreno (m²)
                                </label>
                                <input
                                    type="number"
                                    name="landArea"
                                    value={formData.landArea}
                                    onChange={handleChange}
                                    required
                                    className="w-full mt-1 p-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Quartos</label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Banheiros</label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Vagas</label>
                                <input
                                    type="number"
                                    name="garage"
                                    value={formData.garage}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Andares</label>
                                <input
                                    type="number"
                                    name="floors"
                                    value={formData.floors}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div className="col-span-2 flex gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="basement"
                                    checked={Boolean(formData.basement)}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-primary-600"
                                />
                                <label className="text-sm font-medium text-gray-700">Possui Porão?</label>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600">
                                Anotações Internas
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full mt-1 p-2 border rounded-md"
                                placeholder="Observações..."
                            />
                        </div>

                        <div className="col-span-2 border-t pt-4 mt-2">
                            <h3 className="font-medium text-gray-800 mb-2">Financeiro & Status</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Valor de Compra (R$)
                            </label>
                            <input
                                type="number"
                                name="purchasePrice"
                                value={formData.purchasePrice}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600">Data de Compra</label>
                            <input
                                type="date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border rounded-md"
                            />
                        </div>

                        <div className="flex items-center gap-2 mt-6">
                            <input
                                type="checkbox"
                                name="isFinanced"
                                checked={formData.isFinanced}
                                onChange={handleChange}
                                className="w-5 h-5 text-primary-600"
                            />
                            <label className="text-sm font-medium text-gray-700">É Financiado?</label>
                        </div>

                        {formData.isFinanced && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Total Financiado (R$)
                                    </label>
                                    <input
                                        type="number"
                                        name="finTotal"
                                        value={formData.finTotal}
                                        onChange={handleChange}
                                        className="w-full mt-1 p-2 border rounded-md bg-yellow-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Total de Parcelas
                                    </label>
                                    <input
                                        type="number"
                                        name="finInstallments"
                                        value={formData.finInstallments}
                                        onChange={handleChange}
                                        className="w-full mt-1 p-2 border rounded-md bg-yellow-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Parcelas Pagas (Qtd)
                                    </label>
                                    <input
                                        type="number"
                                        name="finPaid"
                                        value={formData.finPaid}
                                        onChange={handleChange}
                                        className="w-full mt-1 p-2 border rounded-md bg-yellow-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Dia Vencimento
                                    </label>
                                    <input
                                        type="number"
                                        name="financingDueDay"
                                        value={formData.financingDueDay}
                                        onChange={handleChange}
                                        min="1"
                                        max="31"
                                        className="w-full mt-1 p-2 border rounded-md bg-yellow-50"
                                        placeholder="Dia"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Data Final (Quitado)
                                    </label>
                                    <input
                                        type="date"
                                        name="financingEndDate"
                                        value={formData.financingEndDate}
                                        onChange={handleChange}
                                        className="w-full mt-1 p-2 border rounded-md bg-yellow-50"
                                    />
                                </div>
                            </>
                        )}

                        <div className="col-span-2 flex gap-6 mt-2">
                            <div className="flex-1 p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        name="forRent"
                                        checked={formData.forRent}
                                        onChange={handleChange}
                                        className="w-4 h-4"
                                    />
                                    <label className="font-medium">Para Alugar</label>
                                </div>
                                {formData.forRent && (
                                    <input
                                        type="number"
                                        name="rentPrice"
                                        placeholder="Valor Aluguel"
                                        value={formData.rentPrice}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                )}
                            </div>

                            <div className="flex-1 p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        name="forSale"
                                        checked={formData.forSale}
                                        onChange={handleChange}
                                        className="w-4 h-4"
                                    />
                                    <label className="font-medium">Para Vender</label>
                                </div>
                                {formData.forSale && (
                                    <input
                                        type="number"
                                        name="salePrice"
                                        placeholder="Valor Venda"
                                        value={formData.salePrice}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="col-span-2 mt-4">
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Fotos do Imóvel
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setSelectedFiles(e.target.files)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">
                                    {selectedFiles
                                        ? `${selectedFiles.length} arquivos selecionados`
                                        : 'Clique ou arraste fotos aqui'}
                                </p>
                            </div>
                        </div>

                        <div className="col-span-2 mt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-bold"
                            >
                                {loading ? 'Salvando...' : 'Cadastrar Imóvel'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* handles contract creation modal for one selected property */}
            {contractPropertyId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Novo Contrato</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                                <button
                                    onClick={() => setContractForm((prev) => ({ ...prev, type: 'RENT' }))}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
                                        contractForm.type === 'RENT'
                                            ? 'bg-white shadow text-blue-600'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    Aluguel
                                </button>
                                <button
                                    onClick={() => setContractForm((prev) => ({ ...prev, type: 'SALE' }))}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
                                        contractForm.type === 'SALE'
                                            ? 'bg-white shadow text-green-600'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    Venda
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Inquilino / Comprador
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            className="w-full border p-2 rounded-lg mt-1"
                                            value={contractForm.tenantId}
                                            onChange={(e) =>
                                                setContractForm((prev) => ({
                                                    ...prev,
                                                    tenantId: e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">Selecione...</option>
                                            {tenants.map((tenant) => (
                                                <option key={tenant.id} value={tenant.id}>
                                                    {tenant.name} ({tenant.document})
                                                </option>
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
                                        <label className="block text-sm font-medium text-gray-700">
                                            Fiador (Opcional)
                                        </label>
                                        <select
                                            className="w-full border p-2 rounded-lg mt-1"
                                            value={contractForm.guarantorId}
                                            onChange={(e) =>
                                                setContractForm((prev) => ({
                                                    ...prev,
                                                    guarantorId: e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">Selecione...</option>
                                            {guarantors.map((guarantor) => (
                                                <option key={guarantor.id} value={guarantor.id}>
                                                    {guarantor.name} ({guarantor.document})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Início</label>
                                    <input
                                        type="date"
                                        className="w-full border p-2 rounded-lg mt-1"
                                        value={contractForm.startDate}
                                        onChange={(e) =>
                                            setContractForm((prev) => ({
                                                ...prev,
                                                startDate: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fim</label>
                                    <input
                                        type="date"
                                        className="w-full border p-2 rounded-lg mt-1"
                                        value={contractForm.endDate}
                                        onChange={(e) =>
                                            setContractForm((prev) => ({
                                                ...prev,
                                                endDate: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Valor {contractForm.type === 'RENT' ? 'Aluguel' : 'Venda'} (R$)
                                </label>
                                <input
                                    type="number"
                                    className="w-full border p-2 rounded-lg mt-1"
                                    value={contractForm.rentValue}
                                    onChange={(e) =>
                                        setContractForm((prev) => ({
                                            ...prev,
                                            rentValue: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            {contractForm.type === 'RENT' && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-primary-600"
                                            checked={contractForm.autoRenew}
                                            onChange={(e) =>
                                                setContractForm((prev) => ({
                                                    ...prev,
                                                    autoRenew: e.target.checked,
                                                }))
                                            }
                                        />
                                        <label className="text-sm font-medium text-gray-700">
                                            Renovação Automática?
                                        </label>
                                    </div>
                                    {contractForm.autoRenew && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">
                                                Taxa de Renovação (%)
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full border p-1 rounded mt-1 text-sm"
                                                value={contractForm.renewalRate}
                                                onChange={(e) =>
                                                    setContractForm((prev) => ({
                                                        ...prev,
                                                        renewalRate: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={resetContractForm}
                                    className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreateContract}
                                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 font-bold"
                                >
                                    Criar Contrato
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* handles inline tenant creation inside the contract flow */}
            {showTenantForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
                    <div className="w-full max-w-lg">
                        <PersonForm
                            type="tenant"
                            token={token || ''}
                            onSuccess={(newTenant) => {
                                const createdTenant = newTenant as PersonOption;

                                setTenants((prev) => [...prev, createdTenant]);
                                setContractForm((prev) => ({
                                    ...prev,
                                    tenantId: createdTenant.id,
                                }));
                                setShowTenantForm(false);
                            }}
                            onCancel={() => setShowTenantForm(false)}
                        />
                    </div>
                </div>
            )}

            {/* handles property card list rendering */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {properties.map((property) => (
                    <div
                        key={property.id}
                        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                                    {property.type}
                                </span>
                                <span className="text-gray-400 text-sm">#{property.code}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <MapPin size={18} className="text-gray-400" />
                                {property.nickname || property.address}
                            </h3>
                            <div className="flex gap-4 mt-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Building size={16} /> {property.builtArea}m² (C) / {property.landArea}m²
                                    (T)
                                </span>
                                {property.bedrooms && (
                                    <span className="flex items-center gap-1">
                                        {property.bedrooms} Quartos
                                    </span>
                                )}
                                {property.bathrooms && (
                                    <span className="flex items-center gap-1">🛁 {property.bathrooms} Ban</span>
                                )}
                            </div>
                            {property.city && (
                                <p className="text-xs text-gray-400 mt-1">
                                    {property.city} - {property.state}
                                </p>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                            <div className="flex gap-2">
                                {property.forRent && (
                                    <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded">
                                        Aluguel: R$ {Number(property.rentPrice).toLocaleString('pt-BR')}
                                    </span>
                                )}
                                {property.forSale && (
                                    <span className="text-orange-600 font-medium text-sm bg-orange-50 px-2 py-1 rounded">
                                        Venda: R$ {Number(property.salePrice).toLocaleString('pt-BR')}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenContractModal(property.id);
                                    }}
                                    className="text-primary-600 font-medium text-sm hover:underline flex items-center gap-1"
                                >
                                    <FileText size={16} /> Contrato
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDetailsPropertyId(property.id);
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

            {/* handles property detail modal outside the contract and create flows */}
            {detailsPropertyId && !showForm && (
                <PropertyDetailsModal
                    propertyId={detailsPropertyId}
                    onClose={() => setDetailsPropertyId(null)}
                    token={token || ''}
                    onUpdate={fetchProperties}
                />
            )}
        </div>
    );
}