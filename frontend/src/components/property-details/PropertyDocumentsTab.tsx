import { ChangeEvent } from 'react';
import { Download, FileText, UploadCloud } from 'lucide-react';

type PropertyDocument = {
    id: string;
    title: string;
    filePath: string;
    createdAt: string | Date;
};

type PropertyDocumentsTabProps = {
    documents?: PropertyDocument[];
    onUploadDocument: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function PropertyDocumentsTab({
    documents = [],
    onUploadDocument,
}: PropertyDocumentsTabProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700">Documentação</h3>

                <label className="cursor-pointer bg-primary-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-primary-700 flex items-center gap-2">
                    <UploadCloud size={16} />
                    Upload
                    <input type="file" className="hidden" onChange={onUploadDocument} />
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded text-blue-600">
                                <FileText size={20} />
                            </div>

                            <div>
                                <p className="font-medium text-gray-800">{doc.title}</p>
                                <p className="text-xs text-gray-400">
                                    {new Date(doc.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <a
                            href={doc.filePath}
                            download
                            className="text-gray-400 hover:text-primary-600 p-2"
                        >
                            <Download size={18} />
                        </a>
                    </div>
                ))}

                {documents.length === 0 && (
                    <div className="col-span-2 py-12 text-center text-gray-400 border-2 border-dashed rounded-lg">
                        Nenhum documento anexado.
                    </div>
                )}
            </div>
        </div>
    );
}