import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { api } from '../api';

interface LeaseListItem {
    id: string;
    type: 'RENT' | 'SALE' | string;
    isActive: boolean;
    rentValue?: number | string;
    rentDueDay?: number;
    startDate: string;
    endDate: string;
    property?: {
        code?: string;
        nickname?: string;
        address?: string;
    };
    tenant?: {
        name?: string;
        document?: string;
    };
}

export default function ContractsPage() {
    const { token } = useAuth();
    const [leases, setLeases] = useState<LeaseListItem[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        fetchLeases();
    }, [token]);

    const fetchLeases = async () => {
        if (!token) return;

        try {
            const data = await api.leases.findAll(token) as LeaseListItem[];
            setLeases(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getPropertyLabel = (lease: LeaseListItem) => {
        return (
            lease.property?.nickname ||
            lease.property?.address ||
            lease.property?.code ||
            'Imóvel sem identificação'
        );
    };

    const filteredLeases = leases.filter((lease) => {
        if (filter === 'ACTIVE') return lease.isActive;
        if (filter === 'INACTIVE') return !lease.isActive;
        return true;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Contratos</h1>
                    <p className="text-gray-500">Gerencie todos os contratos de aluguel e venda</p>
                </div>
                <Link
                    to="/admin/properties"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-bold flex items-center gap-2"
                >
                    <FileText size={18} />
                    Novo Contrato
                </Link>
            </div>

            <div className="bg-white p-1 rounded-lg border inline-flex mb-6">
                <button
                    onClick={() => setFilter('ALL')}
                    className={clsx(
                        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        filter === 'ALL' ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                    )}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilter('ACTIVE')}
                    className={clsx(
                        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        filter === 'ACTIVE'
                            ? 'bg-green-50 text-green-700'
                            : 'text-gray-500',
                    )}
                >
                    Ativos
                </button>
                <button
                    onClick={() => setFilter('INACTIVE')}
                    className={clsx(
                        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        filter === 'INACTIVE'
                            ? 'bg-red-50 text-red-700'
                            : 'text-gray-500',
                    )}
                >
                    Inativos
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Carregando contratos...</p>
                </div>
            ) : filteredLeases.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-800">Nenhum contrato encontrado</h3>
                    <p className="text-gray-500 mb-6">
                        Não há contratos que correspondam ao filtro selecionado.
                    </p>
                    <Link to="/admin/properties" className="text-primary-600 font-bold hover:underline">
                        Ir para Imóveis
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLeases.map((lease) => (
                        <div
                            key={lease.id}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className={`px-2 py-1 rounded-md text-xs font-bold ${
                                                lease.type === 'RENT'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}
                                        >
                                            {lease.type === 'RENT' ? 'ALUGUEL' : 'VENDA'}
                                        </span>
                                        <Link
                                            to="/admin/properties"
                                            className="text-gray-400 hover:text-primary-600 text-sm font-mono"
                                        >
                                            #{lease.property?.code}
                                        </Link>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                                        {getPropertyLabel(lease)}
                                    </h3>

                                    <p className="text-gray-500 text-sm flex items-center gap-1">
                                        <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 text-xs">
                                            P
                                        </div>
                                        {lease.property?.address || 'Endereço não disponível'}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6 md:min-w-[400px]">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                            <div className="w-3 h-3 rounded-full bg-gray-200"></div> Inquilino
                                        </p>
                                        <p className="font-medium text-gray-800">
                                            {lease.tenant?.name || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {lease.tenant?.document}
                                        </p>
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                            <DollarSign size={12} /> Valor Aluguel
                                        </p>
                                        <p className="font-bold text-gray-800 text-lg">
                                            R${' '}
                                            {Number(lease.rentValue ?? 0).toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Vence dia {lease.rentDueDay ?? '-'}
                                        </p>
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                            <div className="w-3 h-3 rounded-full bg-gray-200"></div> Vigência
                                        </p>
                                        <p className="text-sm text-gray-800">
                                            {new Date(lease.startDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            até {new Date(lease.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    {lease.isActive ? (
                                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div> Ativo
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                                            <div className="w-2 h-2 rounded-full bg-gray-500"></div> Inativo
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}