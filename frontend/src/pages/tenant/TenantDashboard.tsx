import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Wrench, CreditCard, LogOut, Download } from 'lucide-react';

export default function TenantDashboard() {
    const { token, user, logout } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        fetch('/api/portal/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [token]);

    if (loading) return <div className="p-8 text-center">Carregando seus dados...</div>;
    if (!data || !data.tenant) return <div className="p-8 text-center text-red-500">Perfil de inquilino não encontrado.</div>;

    const { tenant, activeLease, openInvoices } = data;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Olá, {tenant.name.split(' ')[0]}</h1>
                        <p className="text-gray-500">Bem-vindo ao seu portal.</p>
                    </div>
                    <button onClick={logout} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Sair">
                        <LogOut />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Active Contract */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <FileText className="text-blue-600" />
                            Seu Contrato Atual
                        </h2>
                        {activeLease ? (
                            <div className="space-y-3">
                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <p className="text-sm text-blue-600 font-semibold uppercase">Imóvel</p>
                                    <p className="font-bold text-gray-800">{activeLease.property.address}</p>
                                    <p className="text-sm text-gray-600">{activeLease.property.nickname}</p>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Vencimento Aluguel:</span>
                                    <span className="font-medium">Dia {activeLease.rentDueDay}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Valor Atual:</span>
                                    <span className="font-medium">R$ {Number(activeLease.rentValue).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Fim do Contrato:</span>
                                    <span className="font-medium">{new Date(activeLease.endDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Nenhum contrato ativo encontrado.</p>
                        )}
                    </div>

                    {/* Open Invoices */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <CreditCard className="text-green-600" />
                            Faturas em Aberto
                        </h2>
                        {openInvoices.length > 0 ? (
                            <div className="space-y-3">
                                {openInvoices.map((inv: any) => (
                                    <div key={inv.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="font-bold text-gray-800">{inv.description}</p>
                                            <p className="text-xs text-gray-500">Vence em: {new Date(inv.dueDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">R$ {Number(inv.amount).toFixed(2)}</p>
                                            <button className="text-xs text-blue-500 hover:underline flex items-center gap-1 justify-end mt-1">
                                                <Download size={12} /> Boleto
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-400">Tudo certo! Nenhuma fatura pendente.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Maintenance Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                        <Wrench className="text-orange-600" />
                        Solicitações
                    </h2>
                    <p className="text-gray-500 mb-4">Precisa de reparo ou manutenção no imóvel?</p>
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                        Abrir Nova Solicitação
                    </button>
                </div>
            </div>
        </div>
    );
}
