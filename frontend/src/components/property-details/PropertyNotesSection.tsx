import { RefObject } from 'react';
import { Send, StickyNote } from 'lucide-react';

type PropertyNote = {
    id: string;
    content: string;
    userId?: string | null;
    createdAt: string | Date;
};

type PropertyNotesSectionProps = {
    notes?: PropertyNote[];
    noteContent: string;
    setNoteContent: (value: string) => void;
    onAddNote: () => void;
    chatEndRef: RefObject<HTMLDivElement>;
};

export default function PropertyNotesSection({
    notes = [],
    noteContent,
    setNoteContent,
    onAddNote,
    chatEndRef,
}: PropertyNotesSectionProps) {
    const currentUserId = getCurrentUserId();

    return (
        <div className="w-1/3 min-w-[320px] max-w-[400px] border-l bg-white flex flex-col h-full z-20 shadow-lg">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <StickyNote size={18} />
                    Chat do Imóvel
                </h3>
                <span className="text-xs text-gray-400">{notes.length} msgs</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                {notes.map((note) => {
                    const isMe = note.userId === currentUserId;

                    return (
                        <div
                            key={note.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl p-3 shadow-sm text-sm ${
                                    isMe
                                        ? 'bg-primary-600 text-white rounded-tr-none'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                }`}
                            >
                                <p>{note.content}</p>
                                <p
                                    className={`text-[10px] mt-1 text-right ${
                                        isMe ? 'opacity-70' : 'text-gray-400'
                                    }`}
                                >
                                    {formatNoteTime(note.createdAt)}
                                </p>
                            </div>
                        </div>
                    );
                })}

                <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t bg-white">
                <div className="flex gap-2 items-center bg-gray-100 rounded-full px-4 py-2">
                    <input
                        className="flex-1 bg-transparent border-none outline-none text-sm"
                        placeholder="Digite uma mensagem..."
                        value={noteContent}
                        onChange={(event) => setNoteContent(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') onAddNote();
                        }}
                        autoFocus
                    />

                    <button
                        onClick={onAddNote}
                        className="text-primary-600 hover:text-primary-800 transition-colors p-1"
                        type="button"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function getCurrentUserId() {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr).id ?? null;
    } catch {
        return null;
    }
}

function formatNoteTime(value: string | Date) {
    return new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}