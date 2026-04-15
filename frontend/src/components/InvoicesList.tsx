import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, FileText, Check, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

interface Invoice {
    id: string;
    description: string;
    dueDate: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    paidAt?: string;
    paidAmount?: number;
    type: 'RECEIVABLE' | 'PAYABLE';
    lease?: {
        id: string;
        property: { nickname: string; address: string };
        tenant: { name: string };
    };
}

interface InvoicesListProps {
    type?: 'PAYABLE' | 'RECEIVABLE';
    leaseId?: string;
    limit?: number;
}

export default function InvoicesList({ type, leaseId, limit }: InvoicesListProps) {
    const { token } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (leaseId) params.append('leaseId', leaseId);

            const res = await fetch(`/api/invoices?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                let data = await res.json();
                if (limit) data = data.slice(0, limit);
                setInvoices(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [type, leaseId, token]);

    const handlePay = async (id: string, amount: number) => {
        if (!confirm('Confirmar baixa neste lançamento?')) return;
        setProcessingId(id);
        try {
            const res = await fetch(`/api/invoices/${id}/pay`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount })
            });
            if (res.ok) {
                fetchInvoices();
            } else {
                alert('Erro ao dar baixa');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Carregando financeiro...</div>;
    }

    if (invoices.length === 0) {
        return <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">Nenhum lançamento encontrado.</div>;
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
                        {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("p-2 rounded-lg",
                                            inv.type === 'RECEIVABLE' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                        )}>
                                            {inv.type === 'RECEIVABLE' ? <DollarSign size={18} /> : <FileText size={18} />}
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900 block">{inv.description}</span>
                                            {inv.lease && (
                                                <span className="text-xs text-gray-500">{inv.lease.property.nickname} - {inv.lease.tenant.name}</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(inv.dueDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    R$ {Number(inv.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={inv.status} />
                                </td>
                                <td className="px-6 py-4">
                                    {inv.status === 'PENDING' || inv.status === 'OVERDUE' ? (
                                        <button
                                            onClick={() => handlePay(inv.id, Number(inv.amount))}
                                            disabled={processingId === inv.id}
                                            className="text-primary-600 hover:text-primary-800 text-xs font-bold uppercase flex items-center gap-1"
                                        >
                                            <Check size={14} />
                                            {processingId === inv.id ? '...' : 'Dar Baixa'}
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 font-medium">Concluído</span>
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
        PENDING: "bg-yellow-100 text-yellow-700",
        PAID: "bg-green-100 text-green-700",
        OVERDUE: "bg-red-100 text-red-700",
        CANCELLED: "bg-gray-100 text-gray-700",
    };

    const labels = {
        PENDING: "Pendente",
        PAID: "Pago",
        OVERDUE: "Atrasado",
        CANCELLED: "Cancelado",
    };

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles]}`}>
            {status === 'PENDING' && <Clock size={12} />}
            {status === 'PAID' && <Check size={12} />}
            {status === 'OVERDUE' && <AlertCircle size={12} />}
            {labels[status as keyof typeof styles] || status}
        </span>
    );
}
