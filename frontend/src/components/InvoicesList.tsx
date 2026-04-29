import { useEffect, useState } from 'react';
import { AlertCircle, Check, Clock, DollarSign, FileText } from 'lucide-react';
import clsx from 'clsx';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { InvoiceListItem } from '../api/invoices.api';

interface InvoicesListProps {
    type?: 'PAYABLE' | 'RECEIVABLE';
    leaseId?: string;
    limit?: number;
}

export default function InvoicesList({ type, leaseId, limit }: InvoicesListProps) {
    const { token } = useAuth();
    const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // handles loading invoices with optional filters and local limit
    const fetchInvoices = async () => {
        if (!token) return;

        setLoading(true);

        try {
            let data = await api.invoices.findAll(token, { type, leaseId });

            if (limit) {
                data = data.slice(0, limit);
            }

            setInvoices(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchInvoices();
    }, [type, leaseId, token]);

    // handles marking one invoice as paid
    const handlePay = async (id: string, amount: number) => {
        if (!token) return;
        if (!confirm('Confirmar baixa neste lançamento?')) return;

        setProcessingId(id);

        try {
            await api.invoices.pay(id, amount, token);
            await fetchInvoices();
        } catch (error) {
            console.error(error);
            alert('Erro ao dar baixa');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Carregando financeiro...</div>;
    }

    if (invoices.length === 0) {
        return (
            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                Nenhum lançamento encontrado.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-4">Descrição</th>
                            <th className="px-6 py-4">Vencimento</th>
                            <th className="px-6 py-4">Valor</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Ações</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={clsx(
                                                'p-2 rounded-lg',
                                                invoice.type === 'RECEIVABLE'
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'bg-red-50 text-red-600',
                                            )}
                                        >
                                            {invoice.type === 'RECEIVABLE' ? (
                                                <DollarSign size={18} />
                                            ) : (
                                                <FileText size={18} />
                                            )}
                                        </div>

                                        <div>
                                            <span className="font-medium text-gray-900 block">
                                                {invoice.description}
                                            </span>
                                            {invoice.lease && (
                                                <span className="text-xs text-gray-500">
                                                    {invoice.lease.property?.nickname ||
                                                        invoice.lease.property?.address ||
                                                        'Imóvel'}{' '}
                                                    - {invoice.lease.tenant?.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {invoice.dueDate
                                        ? new Date(invoice.dueDate).toLocaleDateString()
                                        : 'Sem data'}
                                </td>

                                <td className="px-6 py-4 font-medium text-gray-900">
                                    R${' '}
                                    {Number(invoice.amount).toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                    })}
                                </td>

                                <td className="px-6 py-4">
                                    <StatusBadge status={invoice.status || 'PENDING'} />
                                </td>

                                <td className="px-6 py-4">
                                    {invoice.status === 'PENDING' || invoice.status === 'OVERDUE' ? (
                                        <button
                                            onClick={() =>
                                                handlePay(invoice.id, Number(invoice.amount))
                                            }
                                            disabled={processingId === invoice.id}
                                            className="text-primary-600 hover:text-primary-800 text-xs font-bold uppercase flex items-center gap-1"
                                        >
                                            <Check size={14} />
                                            {processingId === invoice.id ? '...' : 'Dar Baixa'}
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 font-medium">
                                            Concluído
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        PAID: 'bg-green-100 text-green-700',
        OVERDUE: 'bg-red-100 text-red-700',
        CANCELLED: 'bg-gray-100 text-gray-700',
    };

    const labels = {
        PENDING: 'Pendente',
        PAID: 'Pago',
        OVERDUE: 'Atrasado',
        CANCELLED: 'Cancelado',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                styles[status as keyof typeof styles]
            }`}
        >
            {status === 'PENDING' && <Clock size={12} />}
            {status === 'PAID' && <Check size={12} />}
            {status === 'OVERDUE' && <AlertCircle size={12} />}
            {labels[status as keyof typeof labels] || status}
        </span>
    );
}