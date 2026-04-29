import { useEffect, useState } from 'react';
import { CheckCircle, Clock, FileText, XCircle } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { InvoiceListItem } from '../api/invoices.api';

// represents one invoice pending approval in this list
type PendingInvoice = InvoiceListItem & {
    approvalStatus?: string | null;
};

export default function ApprovalsList() {
    const { token } = useAuth();
    const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([]);
    const [loading, setLoading] = useState(true);

    // handles loading invoices and filtering only pending approvals
    const fetchPending = async () => {
        if (!token) return;

        try {
            const data = await api.invoices.findAll(token);
            const pending = data.filter((invoice) => invoice.approvalStatus === 'PENDING');
            setPendingInvoices(pending);
        } catch (error) {
            console.error('Failed to fetch approvals', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchPending();
    }, [token]);

    // handles approving one pending invoice
    const handleApprove = async (id: string) => {
        if (!token) return;
        if (!confirm('Aprovar este pagamento?')) return;

        try {
            await api.invoices.approve(id, token);
            setPendingInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
            alert('Aprovado com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao aprovar.');
        }
    };

    // handles rejecting one pending invoice
    const handleReject = async (id: string) => {
        if (!token) return;
        if (!confirm('Rejeitar este pagamento?')) return;

        try {
            await api.invoices.update(id, { approvalStatus: 'REJECTED' }, token);
            setPendingInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
            alert('Rejeitado.');
        } catch (error) {
            console.error(error);
            alert('Erro ao conectar com servidor.');
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Carregando aprovações...</div>;
    }

    if (pendingInvoices.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} />
                </div>
                <h3 className="font-bold text-gray-800">Tudo em dia!</h3>
                <p className="text-sm text-gray-500">Nenhuma aprovação pendente no momento.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <Clock size={18} className="text-orange-500" /> Aprovações Pendentes
                </h3>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                    {pendingInvoices.length}
                </span>
            </div>

            <div className="divide-y max-h-96 overflow-y-auto">
                {pendingInvoices.map((invoice) => (
                    <div key={invoice.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-gray-800">{invoice.description}</p>
                                <p className="text-xs text-gray-500">
                                    {invoice.dueDate
                                        ? `Vencimento: ${new Date(invoice.dueDate).toLocaleDateString()}`
                                        : 'Sem data'}
                                </p>
                                {invoice.property && (
                                    <p className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1">
                                        <FileText size={10} /> {invoice.property.code || 'Imóvel'}
                                    </p>
                                )}
                            </div>

                            <span className="font-mono font-bold text-gray-900">
                                R$ {Number(invoice.amount).toFixed(2)}
                            </span>
                        </div>

                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => handleApprove(invoice.id)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1 transition-colors"
                            >
                                <CheckCircle size={14} /> Aprovar
                            </button>

                            <button
                                onClick={() => handleReject(invoice.id)}
                                className="flex-1 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 text-gray-600 text-xs font-bold py-2 rounded flex items-center justify-center gap-1 transition-colors"
                            >
                                <XCircle size={14} /> Rejeitar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}