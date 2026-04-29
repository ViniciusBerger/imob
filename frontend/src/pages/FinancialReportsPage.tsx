import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, TrendingUp } from 'lucide-react';
import { api } from '../api';
import type { DreReport, ProjectionReportRow } from '../api/stats.api';
import { useAuth } from '../contexts/AuthContext';

// represents one row in the report summary block
interface ReportRowProps {
    label: string;
    value: number;
    color?: string;
    isBold?: boolean;
    size?: string;
}

export default function FinancialReportsPage() {
    const { token } = useAuth();
    const [view, setView] = useState<'DRE' | 'PROJECTION'>('DRE');
    const [dreData, setDreData] = useState<DreReport | null>(null);
    const [projectionData, setProjectionData] = useState<ProjectionReportRow[]>([]);
    const [loading, setLoading] = useState(true);

    // handles loading the selected report view from the stats api layer
    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setLoading(true);

            try {
                if (view === 'DRE') {
                    const start = new Date(new Date().getFullYear(), 0, 1).toISOString();
                    const end = new Date().toISOString();

                    const data = await api.stats.getDreReport(token, start, end);
                    setDreData(data);
                } else {
                    const data = await api.stats.getProjectionReport(token);
                    setProjectionData(data);
                }
            } catch (error) {
                console.error('Failed to fetch report data', error);
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [token, view]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Relatórios Avançados</h1>
                    <p className="text-gray-500">Análise financeira detalhada e projeções</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setView('DRE')}
                        className={`px-4 py-2 rounded-md transition-all ${
                            view === 'DRE'
                                ? 'bg-white shadow-sm text-blue-600 font-semibold'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        DRE (Resultado)
                    </button>

                    <button
                        onClick={() => setView('PROJECTION')}
                        className={`px-4 py-2 rounded-md transition-all ${
                            view === 'PROJECTION'
                                ? 'bg-white shadow-sm text-blue-600 font-semibold'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Fluxo de Caixa (Projeção)
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Carregando relatório...</div>
            ) : view === 'DRE' && dreData ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <BarChart3 className="text-blue-600" />
                            Demonstração do Resultado do Exercício
                        </h2>
                        <p className="text-sm text-gray-400">
                            Período: {new Date(dreData.period.start).toLocaleDateString()} a{' '}
                            {new Date(dreData.period.end).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        <ReportRow
                            label="Receita Bruta (Aluguéis Recebidos)"
                            value={dreData.grossRevenue}
                            color="text-green-600"
                            isBold
                        />
                        <ReportRow
                            label="(-) Impostos / Taxas (Estimado)"
                            value={-dreData.taxes}
                            color="text-red-500"
                        />
                        <div className="border-t border-gray-100 my-2"></div>
                        <ReportRow label="(=) Receita Líquida" value={dreData.netRevenue} />
                        <ReportRow
                            label="(-) Despesas Operacionais (Manutenção/Contas)"
                            value={-dreData.operatingExpenses}
                            color="text-red-500"
                        />
                        <div className="border-t border-gray-200 my-2"></div>
                        <ReportRow
                            label="(=) Lucro/Prejuízo Líquido"
                            value={dreData.netIncome}
                            size="text-xl"
                            isBold
                            color={dreData.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}
                        />
                    </div>
                </div>
            ) : view === 'PROJECTION' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="text-blue-600" />
                            Projeção de Fluxo de Caixa (6 Meses)
                        </h2>
                        <p className="text-sm text-gray-400">
                            Estimativa baseada em contratos ativos e despesas fixas
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Mês</th>
                                    <th className="p-4 text-right text-green-600">
                                        Entradas Previstas
                                    </th>
                                    <th className="p-4 text-right text-red-600">
                                        Saídas Previstas
                                    </th>
                                    <th className="p-4 text-right">Saldo Projetado</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {projectionData.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-700 capitalize">
                                            {row.month}
                                        </td>
                                        <td className="p-4 text-right font-mono text-green-600">
                                            R${' '}
                                            {row.inflow.toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="p-4 text-right font-mono text-red-600">
                                            R${' '}
                                            {row.outflow.toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td
                                            className={`p-4 text-right font-mono font-bold ${
                                                row.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                                            }`}
                                        >
                                            R${' '}
                                            {row.balance.toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

// handles rendering one financial report summary row
function ReportRow({
    label,
    value,
    color = 'text-gray-800',
    isBold = false,
    size = 'text-base',
}: ReportRowProps) {
    return (
        <div className="flex justify-between items-center">
            <span className={`${size} ${isBold ? 'font-bold' : 'font-medium'} text-gray-600`}>
                {label}
            </span>
            <span className={`${size} ${isBold ? 'font-bold' : ''} ${color} font-mono`}>
                {value < 0 ? '-' : ''} R${' '}
                {Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
        </div>
    );
}