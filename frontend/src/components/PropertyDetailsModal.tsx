import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Building, Key, DollarSign, FileText, Settings, Wrench } from 'lucide-react';
import { api, Property } from '../api';
import PropertyNotesSection from './property-details/PropertyNotesSection';
import PropertyInfoTab from './property-details/PropertyInfoTab';
import PropertyDocumentsTab from './property-details/PropertyDocumentsTab';
import PropertyMaintenanceTab from './property-details/PropertyMaintenanceTab';
import PropertyFinanceTab from './property-details/PropertyFinanceTab';
import PropertyContractsTab from './property-details/PropertyContractsTab';
import PropertySettingsTab from './property-details/PropertySettingsTab';

interface PropertyDetailsModalProps {
    propertyId: string;
    onClose: () => void;
    token: string;
    onUpdate: () => void;
}

export default function PropertyDetailsModal({
    propertyId,
    onClose,
    token,
    onUpdate,
}: PropertyDetailsModalProps) {
    const [activeTab, setActiveTab] = useState('info');
    const [property, setProperty] = useState<Property | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [noteContent, setNoteContent] = useState('');
    const [newExpense, setNewExpense] = useState({
        name: '',
        value: '',
        frequency: 'MONTHLY',
    });

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchProperty();
    }, [propertyId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [property?.notes, activeTab]);

    const fetchProperty = async () => {
        try {
            const data = await api.properties.findOne(propertyId, token);
            setProperty(data);
            setFormData(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        try {
            await api.properties.update(propertyId, formData, token);
            await fetchProperty();
            setEditMode(false);
            onUpdate();
            alert('Imóvel atualizado com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar imóvel');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja EXCLUIR este imóvel? Esta ação é irreversível.')) return;

        try {
            await api.properties.delete(propertyId, token);
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir imóvel');
        }
    };

    const handleAddNote = async () => {
        if (!noteContent.trim()) return;

        try {
            await api.properties.addNote(propertyId, noteContent, token);
            await fetchProperty();
            setNoteContent('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddPropertyExpense = async () => {
        if (!newExpense.name || !newExpense.value) return;

        try {
            await api.properties.addPropertyExpense(
                propertyId,
                {
                    ...newExpense,
                    value: parseFloat(newExpense.value),
                    autoGenerate: true,
                },
                token,
            );

            setNewExpense({ name: '', value: '', frequency: 'MONTHLY' });
            await fetchProperty();
        } catch (error) {
            console.error(error);
            alert('Erro ao adicionar custo.');
        }
    };

    const handleRemovePropertyExpense = async (expenseId: string) => {
        if (!confirm('Remover este custo fixo?')) return;

        try {
            await api.properties.removePropertyExpense(expenseId, token);
            await fetchProperty();
        } catch (error) {
            console.error(error);
            alert('Erro ao remover custo.');
        }
    };

    const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;

        const file = event.target.files[0];

        try {
            await api.properties.uploadDocument(propertyId, file, file.name, token);
            await fetchProperty();
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar documento');
        }
    };

    const handlePayInvoice = async (invoiceId: string) => {
        if (!confirm('Confirmar pagamento deste aluguel?')) return;

        try {
            await api.finance.updateInvoice(
                invoiceId,
                {
                    status: 'PAID',
                    paidAt: new Date(),
                },
                token,
            );

            await fetchProperty();
            alert('Aluguel quitado!');
        } catch (error) {
            console.error(error);
            alert('Erro ao quitar aluguel');
        }
    };

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = event.target;
        const fieldValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value;

        setFormData((prev: any) => ({
            ...prev,
            [name]: fieldValue,
        }));
    };

    if (!property) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
                <div className="bg-white border-b px-6 py-4 flex justify-between items-center shrink-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {property.nickname || property.address}
                            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                #{property.code}
                            </span>
                        </h2>

                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                            <MapPin size={12} />
                            {property.city} - {property.state}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        type="button"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
                        <div className="flex border-b bg-white px-4 shrink-0 overflow-x-auto">
                            {[
                                { id: 'info', label: 'Detalhes', icon: Building },
                                { id: 'finance', label: 'Financeiro', icon: DollarSign },
                                { id: 'contracts', label: 'Contratos', icon: Key },
                                { id: 'documents', label: 'Documentos', icon: FileText },
                                { id: 'maintenance', label: 'Manutenção', icon: Wrench },
                                { id: 'settings', label: 'Config', icon: Settings },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-primary-600 text-primary-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                    type="button"
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'info' && (
                                <PropertyInfoTab
                                    property={property}
                                    formData={formData}
                                    editMode={editMode}
                                    onStartEdit={() => setEditMode(true)}
                                    onSave={handleSave}
                                    onChange={handleChange}
                                />
                            )}

                            {activeTab === 'finance' && (
                                <PropertyFinanceTab
                                    property={property}
                                    formData={formData}
                                    editMode={editMode}
                                    newExpense={newExpense}
                                    setNewExpense={setNewExpense}
                                    onChange={handleChange}
                                    onAddPropertyExpense={handleAddPropertyExpense}
                                    onRemovePropertyExpense={handleRemovePropertyExpense}
                                />
                            )}

                            {activeTab === 'contracts' && (
                                <PropertyContractsTab
                                    leases={property.leases}
                                    onPayInvoice={handlePayInvoice}
                                />
                            )}

                            {activeTab === 'documents' && (
                                <PropertyDocumentsTab
                                    documents={property.documents}
                                    onUploadDocument={handleUploadDocument}
                                />
                            )}

                            {activeTab === 'maintenance' && (
                                <PropertyMaintenanceTab maintenances={property.maintenances} />
                            )}

                            {activeTab === 'settings' && (
                                <PropertySettingsTab onDelete={handleDelete} />
                            )}
                        </div>
                    </div>

                    <PropertyNotesSection
                        notes={property.notes}
                        noteContent={noteContent}
                        setNoteContent={setNoteContent}
                        onAddNote={handleAddNote}
                        chatEndRef={chatEndRef}
                    />
                </div>
            </div>

            <style>{`
                .label-tiny { @apply block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1; }
                .input-clean { @apply w-full p-0 border-b border-transparent hover:border-gray-200 focus:border-primary-500 focus:ring-0 text-sm bg-transparent transition-colors outline-none; }
                .input-tiny { @apply border rounded px-2 py-1 text-xs outline-none focus:border-primary-500; }
                .btn-tiny { @apply rounded px-2 py-1 text-xs font-bold transition-transform active:scale-95; }
            `}</style>
        </div>
    );
}