import { Wrench } from 'lucide-react';

type MaintenanceRecord = {
    id: string;
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    createdAt?: string | Date;
};

type PropertyMaintenanceTabProps = {
    maintenances?: MaintenanceRecord[];
};

export default function PropertyMaintenanceTab({
    maintenances = [],
}: PropertyMaintenanceTabProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <h3 className="font-bold text-gray-700 mb-6">Manutenções</h3>

            <div className="space-y-3">
                {maintenances.map((maintenance) => (
                    <div
                        key={maintenance.id}
                        className="bg-white p-4 rounded-lg border flex items-start gap-3"
                    >
                        <div className="bg-orange-50 text-orange-600 p-2 rounded">
                            <Wrench size={20} />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                                <p className="font-semibold text-gray-800">
                                    {maintenance.title || maintenance.description || 'Manutenção'}
                                </p>

                                {maintenance.status && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                                        {maintenance.status}
                                    </span>
                                )}
                            </div>

                            {maintenance.title && maintenance.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {maintenance.description}
                                </p>
                            )}

                            <div className="flex gap-3 mt-2 text-xs text-gray-400">
                                {maintenance.priority && <span>{maintenance.priority}</span>}
                                {maintenance.createdAt && (
                                    <span>
                                        {new Date(maintenance.createdAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {maintenances.length === 0 && (
                    <div className="py-12 text-center text-gray-400 border-2 border-dashed rounded-lg">
                        Nenhuma manutenção registrada.
                    </div>
                )}
            </div>
        </div>
    );
}