import { useState, useEffect } from 'react';
import {
    BadgeDollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import InvoicesList from '../components/InvoicesList';
import { api, DashboardStats } from '../api';

interface ExpenseItem {
    id: string;
    description: string;
    category?: string;
    date: string;
    amount: number | string;
    property?: {
        address?: string;
    };
}

export default function FinancePage() {
    const { token } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [statsData, expensesData] = await Promise.all([
                    api.stats.getDashboard(token),
                    api.expenses.findAll(token),
                ]);

                setStats(statsData);
                setExpenses(expensesData || []);
            } catch (error) {
                console.error('Failed to fetch finance data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">
                Carregando dados financeiros...
            </div>
        );
    }

    const totalRevenue = stats?.financials?.totalRevenue ?? 0;
    const totalFixedCosts = stats?.financials?.totalFixedCosts ?? 0;
    const netIncome = stats?.financials?.netIncome ?? 0;

    const totalFlow = totalRevenue + totalFixedCosts;
    const incomePercent = totalFlow > 0 ? (totalRevenue / totalFlow) * 100 : 0;
    const expensePercent = totalFlow > 0 ? (totalFixedCosts / totalFlow) * 100 : 0;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Financeiro</h1>
                <p className="text-gray-500">Visão geral de receitas e despesas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={100} className="text-green-600" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <BadgeDollarSign size={24} />
                        </div>
                        <h3 className="font-semibold text-gray-600">Receita Mensal Estimada</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">
                        R$ {Number(totalRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <ArrowUp size={14} /> Baseada em contratos ativos
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown size={100} className="text-red-600" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                            <TrendingDown size={24} />
                        </div>
                        <h3 className="font-semibold text-gray-600">Custos Fixos Mensais</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">
                        R$ {Number(totalFixedCosts).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <ArrowDown size={14} /> IPTU, Condomínios, etc.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet size={100} className="text-blue-600" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Wallet size={24} />
                        </div>
                        <h3 className="font-semibold text-gray-600">Saldo Líquido Estimado</h3>
                    </div>
                    <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        R$ {Number(netIncome).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">Receita - Custos Fixos</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Balanço Financeiro</h3>
                <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm font-bold text-green-600 w-24">Receitas</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${incomePercent}%` }}
                        ></div>
                    </div>
                    <span className="text-sm font-mono text-gray-600">
                        {incomePercent.toFixed(1)}%
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-red-600 w-24">Despesas</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${expensePercent}%` }}
                        ></div>
                    </div>
                    <span className="text-sm font-mono text-gray-600">
                        {expensePercent.toFixed(1)}%
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Contas a Receber</h3>
                    <InvoicesList type="RECEIVABLE" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Contas a Pagar (Financiamentos/Boletos)
                    </h3>
                    <InvoicesList type="PAYABLE" />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Últimas Despesas Lançadas</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-4 font-semibold">Descrição</th>
                                <th className="p-4 font-semibold">Categoria</th>
                                <th className="p-4 font-semibold">Data</th>
                                <th className="p-4 font-semibold">Imóvel Associado</th>
                                <th className="p-4 font-semibold text-right">Valor</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {expenses.length > 0 ? (
                                expenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-800">
                                            {exp.description}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase">
                                                {exp.category || 'Geral'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {new Date(exp.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {exp.property?.address || '-'}
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold text-red-600">
                                            - R${' '}
                                            {Number(exp.amount).toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        Nenhuma despesa registrada recentemente.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}