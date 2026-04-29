import { useEffect, useState } from 'react';
import { api } from '../api';

// represents one tenant option in the guarantor tenant-link dropdown
interface PersonOption {
    id: string;
    name: string;
    document: string;
}

// represents the editable person data that may come from the parent page
interface PersonFormInitialData {
    id: string;
    name?: string;
    document?: string;
    email?: string | null;
    phone?: string | null;
    tenantId?: string | null;
}

// represents the local form state used by this component
interface PersonFormData {
    name: string;
    document: string;
    email: string;
    phone: string;
    tenantId: string;
}

interface PersonFormProps {
    type: 'tenant' | 'guarantor';
    token: string;
    onSuccess: (data: unknown) => void;
    onCancel: () => void;
    initialData?: PersonFormInitialData;
    tenantsList?: PersonOption[];
}

// keeps the empty form state in one place for create mode and reset behavior
const EMPTY_FORM: PersonFormData = {
    name: '',
    document: '',
    email: '',
    phone: '',
    tenantId: '',
};

export default function PersonForm({
    type,
    token,
    onSuccess,
    onCancel,
    initialData,
    tenantsList = [],
}: PersonFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<PersonFormData>(EMPTY_FORM);

    // keeps local form state aligned with edit mode vs create mode
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                document: initialData.document || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                tenantId: initialData.tenantId || '',
            });
            return;
        }

        setFormData(EMPTY_FORM);
    }, [initialData]);

    // handles updating local form state for text inputs and select inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // handles create and update flows for tenants and guarantors
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let data: unknown;

            // handles tenant create and update requests
            if (type === 'tenant') {
                const payload = {
                    name: formData.name,
                    document: formData.document,
                    email: formData.email,
                    phone: formData.phone,
                };

                data = initialData?.id
                    ? await api.tenants.update(initialData.id, payload, token)
                    : await api.tenants.create(payload, token);
            } else {
                // handles guarantor create and update requests
                // only includes tenantId when the guarantor is actually linked to a tenant
                const payload = {
                    name: formData.name,
                    document: formData.document,
                    email: formData.email,
                    phone: formData.phone,
                    ...(formData.tenantId ? { tenantId: formData.tenantId } : {}),
                };

                data = initialData?.id
                    ? await api.guarantors.update(initialData.id, payload, token)
                    : await api.guarantors.create(payload, token);
            }

            onSuccess(data);
        } catch (error: any) {
            console.error(error);
            alert(`Erro: ${error?.message || 'Falha ao salvar'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
                {initialData ? 'Editar Cadastro' : type === 'tenant' ? 'Novo Inquilino' : 'Novo Fiador'}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-600">Nome Completo</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 p-2 border rounded-md"
                    />
                </div>

                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-600">Documento (CPF/CNPJ)</label>
                    <input
                        name="document"
                        value={formData.document}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 p-2 border rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 p-2 border rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600">Telefone</label>
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 p-2 border rounded-md"
                    />
                </div>

                {/* shows tenant linking only when editing or creating a guarantor */}
                {type === 'guarantor' && (
                    <div className="col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                            Vincular a Inquilino (Opcional)
                        </label>
                        <select
                            name="tenantId"
                            value={formData.tenantId}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-md bg-white"
                        >
                            <option value="">Selecione um inquilino...</option>
                            {tenantsList.map((tenant) => (
                                <option key={tenant.id} value={tenant.id}>
                                    {tenant.name} ({tenant.document})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="col-span-2 mt-4 flex gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-lg hover:bg-gray-200 font-bold"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-bold"
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
}