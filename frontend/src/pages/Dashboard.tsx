import { useState, useEffect } from 'react';
import { TrendingUp, Users, Building2, Wallet, Home, DollarSign, ArrowUpRight, ArrowDownRight, PiggyBank } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api, DashboardStats } from '../services/api';
import ApprovalsList from '../components/ApprovalsList';

export default function Dashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalProperties: 0,
        rentedProperties: 0,
        availableProperties: 0,
        occupancyRate: 0,
        alerts: { expiringContracts: [] },
        financials: {
            totalRevenue: 0,
            totalFixedCosts: 0,
            netIncome: 0,
            patrimony: { assets: 0, liabilities: 0, netWorth: 0 },
            cashFlow: { projectedIncome: 0, realizedIncome: 0, projectedExpenses: 0, realizedExpenses: 0 }
        }
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (token) {
                    const data = await api.stats.getDashboard(token);
                    setStats(data);
                }
            } catch (error) { console.error(error); }
        };
        fetchStats();
    }, [token]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
    };

    const cards = [
        { name: 'Receita Mensal (Proj.)', value: formatCurrency(stats.financials?.totalRevenue || 0), icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Imóveis Ativos', value: stats.totalProperties.toString(), icon: Home, color: 'text-purple-600', bg: 'bg-purple-100' },
        { name: 'Taxa de Ocupação', value: `${Number(stats.occupancyRate).toFixed(0)}%`, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
        { name: 'Patrimônio Líquido', value: formatCurrency(stats.financials?.patrimony?.netWorth || 0), icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    ];

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
                <p className="text-gray-500">Acompanhe o desempenho do seu portfólio.</p>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bg}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Financial Detail Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cash Flow Realized vs Projected */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-6 flex items-center gap-2">
                        <DollarSign size={20} className="text-blue-500" /> Fluxo de Caixa (Mês Atual)
                    </h3>

                    <div className="space-y-6">
                        {/* Income */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Receitas</span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(stats.financials?.cashFlow?.realizedIncome || 0)} / {formatCurrency(stats.financials?.cashFlow?.projectedIncome || 0)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full"
                                    style={{ width: `${Math.min(100, ((stats.financials?.cashFlow?.realizedIncome || 0) / (stats.financials?.cashFlow?.projectedIncome || 1)) * 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Realizado</span>
                                <span>Projetado</span>
                            </div>
                        </div>

                        {/* Expenses */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Despesas (Fixas + Manut.)</span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(stats.financials?.cashFlow?.realizedExpenses || 0)} (Est.)
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div
                                    className="bg-red-400 h-2.5 rounded-full"
                                    style={{ width: '100%' }} // expenses are mostly estimated/projected for now
                                ></div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-medium text-gray-600">Resultado Previsto</span>
                            <span className={`text-xl font-bold ${(stats.financials?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(stats.financials?.netIncome || 0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Patrimony Detail */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-6 flex items-center gap-2">
                        <PiggyBank size={20} className="text-emerald-500" /> Detalhes do Patrimônio
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowUpRight size={16} className="text-green-500" />
                                <span className="text-sm font-medium text-gray-500">Ativos (Imóveis)</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.financials?.patrimony?.assets || 0)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowDownRight size={16} className="text-red-500" />
                                <span className="text-sm font-medium text-gray-500">Passivos (Financ.)</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.financials?.patrimony?.liabilities || 0)}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Comprometimento Patrimonial</span>
                            <span className="text-sm font-medium text-gray-900">
                                {((stats.financials?.patrimony?.liabilities || 0) / (stats.financials?.patrimony?.assets || 1) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div
                                className="bg-orange-400 h-2.5 rounded-full"
                                style={{ width: `${Math.min(100, ((stats.financials?.patrimony?.liabilities || 0) / (stats.financials?.patrimony?.assets || 1) * 100))}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Porcentagem do valor dos imóveis que ainda está financiada.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Approvals - Keeping existing */}
                <div className="lg:col-span-2">
                    <ApprovalsList />
                </div>

                {/* Alerts - Keeping existing */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-h-96 overflow-y-auto">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Wallet size={18} className="text-red-500" /> Contratos a Vencer (30d)
                    </h3>
                    <div className="space-y-4">
                        {stats.alerts?.expiringContracts?.length > 0 ? (
                            stats.alerts.expiringContracts.map((c: any) => {
                                const daysLeft = Math.ceil((new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                return (
                                    <div key={c.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${daysLeft < 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {daysLeft}d
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{c.propertyTitle}</p>
                                            <p className="text-xs text-gray-500">Vence em {new Date(c.endDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-400 text-sm text-center py-10">Nenhum contrato vencendo em breve.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
