import { useState, useEffect } from 'react';
import { Plus, Calendar, Wrench, AlertCircle, CheckCircle } from 'lucide-react';

export default function MaintenanceTab({ propertyId }: { propertyId: string }) {
    const [maintenances, setMaintenances] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    // Simple state for form
    const [formData, setFormData] = useState({ title: '', scheduledDate: '', cost: '', status: 'PENDING' });

    useEffect(() => {
        // Fetch logic would go here
    }, [propertyId]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Manutenções Programadas</h3>
                <button onClick={() => setShowForm(!showForm)} className="btn-secondary text-sm flex items-center gap-2">
                    <Plus size={16} />
                    Nova Manutenção
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-50 p-4 rounded-lg border animate-fade-in mb-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input className="input-field" placeholder="Título (ex: Pintura)" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        <input type="date" className="input-field" value={formData.scheduledDate} onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })} />
                        <input type="number" className="input-field" placeholder="Custo Estimado" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                        <select className="input-field" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            <option value="PENDING">Pendente</option>
                            <option value="IN_PROGRESS">Em Andamento</option>
                            <option value="COMPLETED">Concluída</option>
                        </select>
                    </div>
                    <button className="btn-primary w-full">Salvar</button>
                </div>
            )}

            <div className="space-y-3">
                {/* Mock item */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                            <Wrench size={20} />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">Revisão Elétrica</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Calendar size={14} />
                                15/03/2026
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">R$ 450,00</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold uppercase">Pendente</span>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg opacity-60">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 line-through">Limpeza Caixa D'água</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Calendar size={14} />
                                10/01/2026
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">R$ 200,00</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Concluído</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
