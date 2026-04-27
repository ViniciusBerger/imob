import { ChangeEvent } from 'react';
import { Edit2, Save } from 'lucide-react';

type PropertyInfoTabProps = {
    property: any;
    formData: any;
    editMode: boolean;
    onStartEdit: () => void;
    onSave: () => void;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
};

export default function PropertyInfoTab({
    property,
    formData,
    editMode,
    onStartEdit,
    onSave,
    onChange,
}: PropertyInfoTabProps) {
    const handleEditButtonClick = () => {
        if (editMode) {
            onSave();
            return;
        }

        onStartEdit();
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Dados do Imóvel</h3>

                <button
                    onClick={handleEditButtonClick}
                    className={`text-xs px-3 py-1.5 rounded font-bold flex items-center gap-1 ${
                        editMode ? 'bg-green-600 text-white' : 'bg-primary-50 text-primary-600'
                    }`}
                >
                    {editMode ? (
                        <>
                            <Save size={14} />
                            Salvar
                        </>
                    ) : (
                        <>
                            <Edit2 size={14} />
                            Editar
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded border">
                    <label className="label-tiny">Endereço</label>
                    <input
                        disabled={!editMode}
                        name="address"
                        value={formData.address || ''}
                        onChange={onChange}
                        className="input-clean"
                    />
                </div>

                <div className="bg-white p-4 rounded border">
                    <label className="label-tiny">Apelido</label>
                    <input
                        disabled={!editMode}
                        name="nickname"
                        value={formData.nickname || ''}
                        onChange={onChange}
                        className="input-clean"
                    />
                </div>

                <div className="bg-white p-4 rounded border grid grid-cols-2 gap-2">
                    <div>
                        <label className="label-tiny">Área Útil</label>
                        <input
                            disabled={!editMode}
                            name="builtArea"
                            value={formData.builtArea || ''}
                            onChange={onChange}
                            className="input-clean"
                        />
                    </div>

                    <div>
                        <label className="label-tiny">Área Total</label>
                        <input
                            disabled={!editMode}
                            name="landArea"
                            value={formData.landArea || ''}
                            onChange={onChange}
                            className="input-clean"
                        />
                    </div>
                </div>

                <div className="bg-white p-4 rounded border grid grid-cols-3 gap-2">
                    <div>
                        <label className="label-tiny">Quartos</label>
                        <input
                            disabled={!editMode}
                            name="bedrooms"
                            value={formData.bedrooms || ''}
                            onChange={onChange}
                            className="input-clean"
                        />
                    </div>

                    <div>
                        <label className="label-tiny">Banhos</label>
                        <input
                            disabled={!editMode}
                            name="bathrooms"
                            value={formData.bathrooms || ''}
                            onChange={onChange}
                            className="input-clean"
                        />
                    </div>

                    <div>
                        <label className="label-tiny">Vagas</label>
                        <input
                            disabled={!editMode}
                            name="garage"
                            value={formData.garage || ''}
                            onChange={onChange}
                            className="input-clean"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="label-tiny mb-2 block">Galeria</label>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    {property.photos?.map((src: string, index: number) => {
                        const fullSrc = src.startsWith('http')
                            ? src
                            : `${(import.meta.env.VITE_API_URL || '/api').replace('/api', '')}${src}`;

                        return (
                            <img
                                key={index}
                                src={fullSrc}
                                alt={`Foto ${index + 1}`}
                                className="h-32 w-48 object-cover rounded-lg border"
                                onError={(event) => {
                                    (event.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}