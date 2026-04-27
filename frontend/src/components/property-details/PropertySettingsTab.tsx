type PropertySettingsTabProps = {
    onDelete: () => void;
};

export default function PropertySettingsTab({ onDelete }: PropertySettingsTabProps) {
    return (
        <div className="max-w-4xl mx-auto pt-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-red-800 font-bold mb-2">Zona de Perigo</h3>
                <p className="text-red-600 text-sm mb-4">Ações aqui são irreversíveis.</p>

                <button
                    onClick={onDelete}
                    className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors"
                    type="button"
                >
                    Excluir Imóvel
                </button>
            </div>
        </div>
    );
}