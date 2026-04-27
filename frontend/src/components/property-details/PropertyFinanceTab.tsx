import { ChangeEvent } from 'react';
import { DollarSign, Plus, Trash2 } from 'lucide-react';

type NewPropertyExpense = {
    name: string;
    value: string;
    frequency: string;
};

type PropertyFinanceTabProps = {
    property: any;
    formData: any;
    editMode: boolean;
    newExpense: NewPropertyExpense;
    setNewExpense: (expense: NewPropertyExpense) => void;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onAddPropertyExpense: () => void;
    onRemovePropertyExpense: (expenseId: string) => void;
};

export default function PropertyFinanceTab({
    property,
    formData,
    editMode,
    newExpense,
    setNewExpense,
    onChange,
    onAddPropertyExpense,
    onRemovePropertyExpense,
}: PropertyFinanceTabProps) {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Valores</h4>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Aluguel Base</span>
                            <input
                                disabled={!editMode}
                                name="rentPrice"
                                value={formData.rentPrice || ''}
                                onChange={onChange}
                                className="text-right font-mono font-bold text-gray-800 w-32 input-clean"
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Valor Venda</span>
                            <input
                                disabled={!editMode}
                                name="salePrice"
                                value={formData.salePrice || ''}
                                onChange={onChange}
                                className="text-right font-mono font-bold text-gray-800 w-32 input-clean"
                            />
                        </div>

                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed">
                            <span className="text-sm text-gray-500">Valor Compra</span>
                            <input
                                disabled={!editMode}
                                name="purchasePrice"
                                type="number"
                                value={formData.purchasePrice || ''}
                                onChange={onChange}
                                className="text-right font-mono text-gray-400 w-32 input-clean"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Data Compra</span>
                            <input
                                disabled={!editMode}
                                name="purchaseDate"
                                type="date"
                                value={formatDateInput(formData.purchaseDate)}
                                onChange={onChange}
                                className="text-right font-mono text-gray-400 w-32 input-clean"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm col-span-2 md:col-span-1">
                    <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">
                        Detalhes do Financiamento
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-tiny">Tipo Financ.</label>
                            <select
                                disabled={!editMode}
                                name="financingType"
                                value={formData.financingType || ''}
                                onChange={onChange}
                                className="input-clean bg-transparent w-full"
                            >
                                <option value="">Nenhum/À Vista</option>
                                <option value="PRICE">Tabela Price</option>
                                <option value="SAC">Tabela SAC</option>
                                <option value="DIRECT">Direto c/ Prop.</option>
                            </select>
                        </div>

                        <div>
                            <label className="label-tiny">Fim Financ.</label>
                            <input
                                disabled={!editMode}
                                name="financingEndDate"
                                type="date"
                                value={formatDateInput(formData.financingEndDate)}
                                onChange={onChange}
                                className="input-clean"
                            />
                        </div>

                        <div>
                            <label className="label-tiny">Valor Parcela</label>
                            <input
                                disabled={!editMode}
                                name="installmentValue"
                                type="number"
                                value={formData.installmentValue || ''}
                                onChange={onChange}
                                className="input-clean"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="label-tiny">Total Financiado</label>
                            <input
                                disabled={!editMode}
                                name="financingTotalValue"
                                type="number"
                                value={formData.financingTotalValue || ''}
                                onChange={onChange}
                                className="input-clean"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="label-tiny">Parcelas (Total)</label>
                            <input
                                disabled={!editMode}
                                name="installmentsCount"
                                type="number"
                                value={formData.installmentsCount || ''}
                                onChange={onChange}
                                className="input-clean"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="label-tiny">Parcelas (Pagas)</label>
                            <input
                                disabled={!editMode}
                                name="installmentsPaid"
                                type="number"
                                value={formData.installmentsPaid || ''}
                                onChange={onChange}
                                className="input-clean"
                                placeholder="0"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="label-tiny">Índice Correção</label>
                            <input
                                disabled={!editMode}
                                name="correctionIndex"
                                value={formData.correctionIndex || ''}
                                onChange={onChange}
                                className="input-clean"
                                placeholder="Ex: IPCA + 0.5%"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm col-span-2">
                    <h4 className="font-bold text-gray-700 mb-4 border-b pb-2 flex justify-between items-center">
                        <span>Custos Fixos da Propriedade</span>

                        <button
                            onClick={() =>
                                setNewExpense({
                                    ...newExpense,
                                    name: '',
                                    value: '',
                                    frequency: 'MONTHLY',
                                })
                            }
                            className="text-xs font-normal text-primary-600 hover:underline"
                            type="button"
                        >
                            Limpar
                        </button>
                    </h4>

                    <div className="space-y-2 mb-6">
                        {property.propertyExpenses?.map((expense: any) => {
                            const dueDay = expense.dueDay ?? expense.dueDateDay;

                            return (
                                <div
                                    key={expense.id}
                                    className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-full border text-gray-500">
                                            <DollarSign size={16} />
                                        </div>

                                        <div>
                                            <p className="font-bold text-gray-800">{expense.name}</p>
                                            <p className="text-xs text-gray-500 flex gap-2">
                                                <span>{formatFrequency(expense.frequency)}</span>
                                                {dueDay && <span>• Dia {dueDay}</span>}
                                                {expense.autoGenerate && (
                                                    <span className="text-green-600">
                                                        • Gera Fatura Auto
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold text-gray-700">
                                            R$ {Number(expense.value).toFixed(2)}
                                        </span>

                                        <button
                                            onClick={() => onRemovePropertyExpense(expense.id)}
                                            className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            type="button"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {(!property.propertyExpenses || property.propertyExpenses.length === 0) && (
                            <div className="text-center text-gray-400 text-xs py-4 italic">
                                Nenhum custo fixo cadastrado.
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">
                            Adicionar Novo Custo
                        </h5>

                        <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-4">
                                <label className="label-tiny">Nome</label>
                                <input
                                    placeholder="Ex: Condomínio"
                                    className="input-tiny w-full bg-white border-gray-300"
                                    value={newExpense.name}
                                    onChange={(event) =>
                                        setNewExpense({
                                            ...newExpense,
                                            name: event.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="col-span-3">
                                <label className="label-tiny">Valor</label>
                                <input
                                    placeholder="0,00"
                                    type="number"
                                    className="input-tiny w-full bg-white border-gray-300"
                                    value={newExpense.value}
                                    onChange={(event) =>
                                        setNewExpense({
                                            ...newExpense,
                                            value: event.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="col-span-3">
                                <label className="label-tiny">Frequência</label>
                                <select
                                    className="input-tiny w-full bg-white border-gray-300"
                                    value={newExpense.frequency}
                                    onChange={(event) =>
                                        setNewExpense({
                                            ...newExpense,
                                            frequency: event.target.value,
                                        })
                                    }
                                >
                                    <option value="MONTHLY">Mensal</option>
                                    <option value="YEARLY">Anual</option>
                                    <option value="ONCE">Único</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <button
                                    onClick={onAddPropertyExpense}
                                    className="btn-tiny bg-gray-900 text-white w-full h-[26px] flex items-center justify-center gap-1"
                                    type="button"
                                >
                                    <Plus size={12} />
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatDateInput(value: string | Date | null | undefined) {
    if (!value) return '';
    return new Date(value).toISOString().split('T')[0];
}

function formatFrequency(frequency?: string) {
    if (frequency === 'MONTHLY') return 'Mensal';
    if (frequency === 'YEARLY') return 'Anual';
    return 'Único';
}