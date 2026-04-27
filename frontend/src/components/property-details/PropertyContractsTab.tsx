import { CheckCircle } from 'lucide-react';

type PropertyContractsTabProps = {
    leases?: any[];
    onPayInvoice: (invoiceId: string) => void;
};

export default function PropertyContractsTab({
    leases = [],
    onPayInvoice,
}: PropertyContractsTabProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {leases.map((lease) => (
                <div key={lease.id} className="bg-white border rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4 border-b pb-4">
                        <div>
                            <h4 className="font-bold text-lg text-gray-800">
                                {lease.tenant?.name || 'Inquilino'}
                            </h4>
                            <p className="text-sm text-gray-500">
                                CPF: {lease.tenant?.document}
                            </p>
                        </div>

                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                                lease.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                            {lease.isActive ? 'Ativo' : 'Finalizado'}
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm mb-6">
                        <div>
                            <span className="block text-gray-500 text-xs">Início</span>
                            {formatDate(lease.startDate)}
                        </div>

                        <div>
                            <span className="block text-gray-500 text-xs">Fim</span>
                            {formatDate(lease.endDate)}
                        </div>

                        <div>
                            <span className="block text-gray-500 text-xs">Valor</span>
                            <strong>R$ {Number(lease.rentValue).toLocaleString('pt-BR')}</strong>
                        </div>

                        <div>
                            <span className="block text-gray-500 text-xs">Renovação</span>
                            {lease.autoRenew ? 'Sim' : 'Não'}
                        </div>
                    </div>

                    {lease.invoices && lease.invoices.length > 0 && (
                        <div className="mt-4">
                            <h5 className="font-bold text-sm text-gray-600 mb-2">
                                Histórico de Aluguéis
                            </h5>

                            <div className="space-y-2">
                                {lease.invoices
                                    .filter((invoice: any) => invoice.type === 'RENT')
                                    .map((invoice: any) => (
                                        <div
                                            key={invoice.id}
                                            className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                                        >
                                            <span className="text-gray-600">
                                                {formatDate(invoice.dueDate)} - {invoice.description}
                                            </span>

                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`font-mono ${
                                                        invoice.status === 'PAID'
                                                            ? 'text-green-600'
                                                            : 'text-red-500'
                                                    }`}
                                                >
                                                    R$ {Number(invoice.amount).toLocaleString('pt-BR')}
                                                </span>

                                                {invoice.status !== 'PAID' && (
                                                    <button
                                                        onClick={() => onPayInvoice(invoice.id)}
                                                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold hover:bg-green-200"
                                                        type="button"
                                                    >
                                                        Quitar
                                                    </button>
                                                )}

                                                {invoice.status === 'PAID' && (
                                                    <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                                        <CheckCircle size={12} />
                                                        Pago
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {leases.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    Nenhum contrato ativo.
                </div>
            )}
        </div>
    );
}

function formatDate(value?: string | Date) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString();
}