import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, ChevronRight, ChevronLeft, Check, DollarSign, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const STEPS = [
    { name: 'Dados Básicos', icon: FileText },
    { name: 'Características', icon: Check },
    { name: 'Financeiro', icon: DollarSign },
    { name: 'Documentos', icon: Upload },
];

type PropertyWizardFormData = {
    code: string;
    nickname?: string;
    address: string;
    city: string;
    state: string;
    type?: string;
    description?: string;
    builtArea?: number;
    landArea?: number;
    bedrooms?: number;
    bathrooms?: number;
    garage?: number;
    isFinanced?: boolean;
    financingTotalValue?: number;
    installmentValue?: number;
    correctionIndex?: string;
    installmentsPaid?: number;
    forRent?: boolean;
    rentPrice?: number;
    forSale?: boolean;
    salePrice?: number;
};

export default function PropertyWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const { register, handleSubmit, watch } = useForm<PropertyWizardFormData>();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photos, setPhotos] = useState<File[]>([]);
    const [documents, setDocuments] = useState<File[]>([]);

    const token = sessionStorage.getItem('token') || '';

    const onSubmit = async (data: PropertyWizardFormData) => {
        setIsSubmitting(true);

        try {
            const property = await api.properties.create(data, token);

            if (photos.length > 0) {
                await api.properties.uploadPhotos(property.id, toFileList(photos), token);
            }

            if (documents.length > 0) {
                for (const document of documents) {
                    await api.properties.uploadDocument(property.id, document, document.name, token);
                }
            }

            navigate('/properties');
        } catch (error) {
            console.error(error);
            alert('Erro ao criar imóvel');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setCurrentStep((current) => Math.min(current + 1, STEPS.length - 1));
    const prevStep = () => setCurrentStep((current) => Math.max(current - 1, 0));

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Código</label>
                                <input {...register('code', { required: true })} className="input-field" placeholder="Ex: IMO-001" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Apelido (Opcional)</label>
                                <input {...register('nickname')} className="input-field" placeholder="Ex: Casa Praia" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                            <input {...register('address', { required: true })} className="input-field" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cidade</label>
                                <input {...register('city', { required: true })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Estado</label>
                                <input {...register('state', { required: true })} className="input-field" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select {...register('type')} className="input-field">
                                <option value="RESIDENTIAL">Residencial</option>
                                <option value="COMMERCIAL">Comercial</option>
                                <option value="LAND">Terreno</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descrição</label>
                            <textarea {...register('description')} className="input-field h-24" />
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Área Construída (m²)</label>
                                <input type="number" {...register('builtArea', { valueAsNumber: true })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Área Terreno (m²)</label>
                                <input type="number" {...register('landArea', { valueAsNumber: true })} className="input-field" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quartos</label>
                                <input type="number" {...register('bedrooms', { valueAsNumber: true })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Banheiros</label>
                                <input type="number" {...register('bathrooms', { valueAsNumber: true })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vagas</label>
                                <input type="number" {...register('garage', { valueAsNumber: true })} className="input-field" />
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Arraste fotos ou clique para selecionar</p>

                            <input
                                type="file"
                                multiple
                                onChange={(event) => setPhotos(Array.from(event.target.files || []))}
                                className="hidden"
                                id="photo-upload"
                            />

                            <label htmlFor="photo-upload" className="mt-2 inline-block px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-sm">
                                Selecionar Fotos ({photos.length})
                            </label>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <label className="flex items-center gap-2 font-bold text-blue-900">
                                <input type="checkbox" {...register('isFinanced')} className="w-4 h-4" />
                                Imóvel Financiado / Parcelado?
                            </label>
                        </div>

                        {watch('isFinanced') && (
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Valor Total Financiado</label>
                                    <input type="number" {...register('financingTotalValue', { valueAsNumber: true })} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Valor Parcela</label>
                                    <input type="number" {...register('installmentValue', { valueAsNumber: true })} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Índice Correção</label>
                                    <select {...register('correctionIndex')} className="input-field">
                                        <option value="">Nenhum</option>
                                        <option value="IPCA">IPCA</option>
                                        <option value="IGPM">IGPM</option>
                                        <option value="SELIC">SELIC</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Parcelas Pagas</label>
                                    <input type="number" {...register('installmentsPaid', { valueAsNumber: true })} className="input-field" />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" {...register('forRent')} className="w-5 h-5 text-primary-600" />
                                <div>
                                    <span className="font-bold block">Para Alugar</span>
                                    <input type="number" placeholder="Valor Aluguel" {...register('rentPrice', { valueAsNumber: true })} className="mt-1 input-field text-sm" />
                                </div>
                            </label>

                            <label className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" {...register('forSale')} className="w-5 h-5 text-primary-600" />
                                <div>
                                    <span className="font-bold block">Para Venda</span>
                                    <input type="number" placeholder="Valor Venda" {...register('salePrice', { valueAsNumber: true })} className="mt-1 input-field text-sm" />
                                </div>
                            </label>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                            <FileText className="mx-auto text-gray-400 mb-4 h-12 w-12" />
                            <h3 className="text-lg font-medium text-gray-900">Documentação do Imóvel</h3>
                            <p className="text-gray-500 mb-4">Anexe Escritura, Matrícula, IPTU, etc.</p>

                            <input
                                type="file"
                                multiple
                                onChange={(event) => setDocuments(Array.from(event.target.files || []))}
                                className="hidden"
                                id="doc-upload"
                            />

                            <label htmlFor="doc-upload" className="inline-block px-6 py-3 bg-white border border-gray-300 shadow-sm rounded-lg cursor-pointer hover:bg-gray-50 font-medium text-primary-600">
                                Escolher Arquivos
                            </label>

                            {documents.length > 0 && (
                                <ul className="mt-4 text-left max-w-sm mx-auto space-y-2">
                                    {documents.map((document, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded border">
                                            <FileText size={16} />
                                            {document.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 p-4">
                <div className="flex justify-between items-center">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isComplete = index < currentStep;

                        return (
                            <div key={step.name} className={`flex flex-col items-center gap-2 flex-1 ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg scale-110' : isComplete ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                    <Icon size={20} />
                                </div>
                                <span className="text-xs font-semibold hidden sm:block">{step.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="p-8 min-h-[400px]">
                {renderStepContent()}
            </div>

            <div className="bg-gray-50 border-t border-gray-100 p-6 flex justify-between">
                <button onClick={prevStep} disabled={currentStep === 0} className="btn-secondary flex items-center gap-2 disabled:opacity-50">
                    <ChevronLeft size={20} />
                    Anterior
                </button>

                {currentStep < STEPS.length - 1 ? (
                    <button onClick={nextStep} className="btn-primary flex items-center gap-2">
                        Próximo
                        <ChevronRight size={20} />
                    </button>
                ) : (
                    <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700">
                        {isSubmitting ? 'Salvando...' : 'Finalizar Cadastro'}
                        <Check size={20} />
                    </button>
                )}
            </div>
        </div>
    );
}

function toFileList(files: File[]) {
    const dataTransfer = new DataTransfer();

    files.forEach((file) => {
        dataTransfer.items.add(file);
    });

    return dataTransfer.files;
}