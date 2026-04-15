import React, { useState, useEffect } from 'react';
import { api, API_URL } from '../api';

interface PersonFormProps {
    type: 'tenant' | 'guarantor';
    token: string;
    onSuccess: (data: any) => void;
    onCancel: () => void;
    initialData?: any;
    tenantsList?: any[]; // For linking guarantor to tenant
}

export default function PersonForm({ type, token, onSuccess, onCancel, initialData, tenantsList = [] }: PersonFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        document: '',
        email: '',
        phone: '',
        tenantId: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                document: initialData.document || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                tenantId: initialData.tenantId || ''
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        console.log('Sending payload:', formData);

        const baseUrl = `${API_URL}/${type === 'tenant' ? 'tenants' : 'guarantors'}`;
        const url = initialData?.id ? `${baseUrl}/${initialData.id}` : baseUrl;
        const method = initialData?.id ? 'PATCH' : 'POST';

        // Prepare payload - strip tenantId if type is tenant
        const payload: any = { ...formData };
        if (type === 'tenant') {
            delete payload.tenantId;
        }
        // Optional: clean up empty strings if necessary, but backend might handle them. 
        // For now, addressing the specific "property matches" error.


        try {
            // Using direct fetch as api service might not have these endpoints explicitly defined yet
            // or to keep consistent with original code. 
            // Note: api.ts likely needs updates to include these if we want to be pure, but fetch works.
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                onSuccess(data);
            } else {
                const err = await res.json();
                alert(`Erro: ${err.message || 'Falha ao salvar'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
                {initialData ? 'Editar Cadastro' : (type === 'tenant' ? 'Novo Inquilino' : 'Novo Fiador')}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-600">Nome Completo</label>
                    <input name="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-600">Documento (CPF/CNPJ)</label>
                    <input name="document" value={formData.document} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600">Telefone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                </div>

                {type === 'guarantor' && (
                    <div className="col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-sm font-medium text-blue-800 mb-1">Vincular a Inquilino (Opcional)</label>
                        <select name="tenantId" value={formData.tenantId} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md bg-white">
                            <option value="">Selecione um inquilino...</option>
                            {tenantsList.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.document})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="col-span-2 mt-4 flex gap-4">
                    <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-lg hover:bg-gray-200 font-bold">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-bold">
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
}
