import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { api, SiteConfig, UpdateSiteConfigDto } from '../../services/api';
import { Save, Loader2, Monitor, Layout, Palette, Phone } from 'lucide-react';
import clsx from 'clsx';

export default function SiteSettingsPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateSiteConfigDto>();

    useEffect(() => {
        if (token) {
            loadConfig();
        }
    }, [token]);

    const loadConfig = async () => {
        try {
            const config = await api.siteConfig.getAdmin(token!);
            reset(config);
        } catch (error) {
            console.error(error);
            // If fetch fails (first time), defaults might be used or form stays empty
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: UpdateSiteConfigDto) => {
        setSaving(true);
        try {
            await api.siteConfig.update(token!, data);
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Configuração do Site</h1>
                    <p className="text-gray-500">Personalize a aparência e informações do seu site público.</p>
                </div>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Salvar Alterações
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Branding Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 text-blue-600">
                        <Monitor size={20} />
                        <h2 className="font-semibold text-lg">Identidade Visual</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Aplicativo (Cabeçalho)</label>
                            <input {...register('appName')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: eSolu Imóveis" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título da Hero (Destaque Principal)</label>
                            <input {...register('heroTitle')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Encontre o imóvel dos seus sonhos" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo da Hero</label>
                            <input {...register('heroSubtitle')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: As melhores opções da região estão aqui." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem de Fundo</label>
                            <input {...register('heroBackgroundImage')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 text-green-600">
                        <Phone size={20} />
                        <h2 className="font-semibold text-lg">Contato e Rodapé</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone de Contato</label>
                            <input {...register('contactPhone')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contato</label>
                            <input {...register('contactEmail')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                            <input {...register('contactWhatsApp')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 text-purple-600">
                        <Palette size={20} />
                        <h2 className="font-semibold text-lg">Aparência e Cores</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cor Primária</label>
                            <select {...register('primaryColor')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="blue">Azul (Padrão)</option>
                                <option value="red">Vermelho</option>
                                <option value="green">Verde</option>
                                <option value="purple">Roxo</option>
                                <option value="slate">Cinza Escuro</option>
                                <option value="orange">Laranja</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" {...register('showPrices')} id="showPrices" className="w-4 h-4 text-blue-600 rounded" />
                            <label htmlFor="showPrices" className="text-sm text-gray-700">Mostrar Preços Publicamente</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" {...register('showUnavailable')} id="showUnavailable" className="w-4 h-4 text-blue-600 rounded" />
                            <label htmlFor="showUnavailable" className="text-sm text-gray-700">Mostrar Imóveis Indisponíveis (Alugados)</label>
                        </div>
                    </div>
                </div>

                {/* SEO Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 text-gray-600">
                        <Layout size={20} />
                        <h2 className="font-semibold text-lg">SEO e Metadados</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título SEO (Browser Tab)</label>
                            <input {...register('seoTitle')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: eSolu Imóveis - Venda e Aluguel" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Meta</label>
                            <textarea {...register('seoDescription')} rows={3} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Descrição para aparecer no Google..." />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
