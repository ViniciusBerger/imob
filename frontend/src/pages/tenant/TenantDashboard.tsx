import { useEffect, useState } from 'react';
import { CreditCard, Download, FileText, LogOut, Wrench } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

// represents the data shape consumed by the tenant dashboard page
interface TenantDashboardData {
    tenant: {
        id: string;
        name: string;
        email?: string | null;
        phone?: string | null;
        document?: string | null;
    } | null;
    activeLease: {
        id: string;
        rentDueDay?: number | null;
        rentValue: number | string;
        endDate: string;
        property: {
            address: string;
            nickname?: string | null;
        };
    } | null;
    openInvoices: Array<{
        id: string;
        description: string;
        dueDate: string;
        amount: number | string;
    }>;
}

export default function TenantDashboard() {
    const { token, logout } = useAuth();
    const [data, setData] = useState<TenantDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    // handles loading the tenant dashboard from the shared api layer
    useEffect(() => {
        if (!token) return;

        const loadDashboard = async () => {
            setLoading(true);

            try {
                const dashboardData = await api.tenantPortal.getDashboard(token);
                setData(dashboardData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        void loadDashboard();
    }, [token]);

    if (loading) {
        return <div className="p-8 text-center">Carregando seus dados...</div>;
    }

    if (!data || !data.tenant) {
        return (
            <div className="p-8 text-center text-red-500">
                Perfil de inquilino não encontrado.
            </div>
        );
    }

    const { tenant, activeLease, openInvoices } = data;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* handles tenant portal header and logout action */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Olá, {tenant.name.split(' ')[0]}
                        </h1>
                        <p className="text-gray-500">Bem-vindo ao seu portal.</p>
                    </div>

                    <button
                        onClick={logout}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Sair"
                    >
                        <LogOut />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* handles active contract display */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <FileText className="text-blue-600" />
                            Seu Contrato Atual
                        </h2>

                        {activeLease ? (
                            <div className="space-y-3">
                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <p className="text-sm text-blue-600 font-semibold uppercase">
                                        Imóvel
                                    </p>
                                    <p className="font-bold text-gray-800">
                                        {activeLease.property.address}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {activeLease.property.nickname}
                                    </p>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Vencimento Aluguel:</span>
                                    <span className="font-medium">
                                        Dia {activeLease.rentDueDay}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Valor Atual:</span>
                                    <span className="font-medium">
                                        R$ {Number(activeLease.rentValue).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Fim do Contrato:</span>
                                    <span className="font-medium">
                                        {new Date(activeLease.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">
                                Nenhum contrato ativo encontrado.
                            </p>
                        )}
                    </div>

                    {/* handles open invoice display */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <CreditCard className="text-green-600" />
                            Faturas em Aberto
                        </h2>

                        {openInvoices.length > 0 ? (
                            <div className="space-y-3">
                                {openInvoices.map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {invoice.description}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Vence em:{' '}
                                                {new Date(invoice.dueDate).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-green-600">
                                                R$ {Number(invoice.amount).toFixed(2)}
                                            </p>
                                            <button className="text-xs text-blue-500 hover:underline flex items-center gap-1 justify-end mt-1">
                                                <Download size={12} /> Boleto
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-400">
                                    Tudo certo! Nenhuma fatura pendente.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* handles maintenance action entry point */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                        <Wrench className="text-orange-600" />
                        Solicitações
                    </h2>
                    <p className="text-gray-500 mb-4">
                        Precisa de reparo ou manutenção no imóvel?
                    </p>
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                        Abrir Nova Solicitação
                    </button>
                </div>
            </div>
        </div>
    );
}