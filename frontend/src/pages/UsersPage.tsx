import { useEffect, useState } from 'react';
import { Plus, User } from 'lucide-react';
import { api, type UserListItem } from '../api';
import { useAuth } from '../contexts/AuthContext';

type CreateUserFormData = {
    name: string;
    email: string;
    password: string;
    role: string;
};

const INITIAL_FORM_DATA: CreateUserFormData = {
    name: '',
    email: '',
    password: '',
    role: 'VIEWER',
};

export default function UsersPage() {
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState<CreateUserFormData>(INITIAL_FORM_DATA);
    const { token } = useAuth();

    // handles loading all users
    const fetchUsers = async () => {
        if (!token) return;

        try {
            const data = await api.users.findAll(token);
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    useEffect(() => {
        void fetchUsers();
    }, [token]);

    // handles creating one user
    const handleCreate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!token) return;

        try {
            await api.users.create(formData, token);

            await fetchUsers();
            setIsCreateModalOpen(false);
            setFormData(INITIAL_FORM_DATA);
            alert('Usuário criado com sucesso!');
        } catch (error) {
            console.error('Error creating user', error);
            alert('Falha ao criar usuário.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Gerenciamento de Usuários
                    </h1>
                    <p className="text-gray-600">Adicione e gerencie usuários do sistema.</p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    type="button"
                >
                    <Plus size={20} />
                    <span>Novo Usuário</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Nome</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Função</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">
                                Data Criação
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User size={16} />
                                        </div>
                                        <span className="font-medium text-gray-900">
                                            {user.name}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-gray-600">{user.email}</td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}
                                    >
                                        {user.role}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Novo Usuário</h2>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(event) =>
                                        setFormData({ ...formData, name: event.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(event) =>
                                        setFormData({ ...formData, email: event.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Senha
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(event) =>
                                        setFormData({ ...formData, password: event.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Função
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(event) =>
                                        setFormData({ ...formData, role: event.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                >
                                    <option value="VIEWER">Visualizador</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                                >
                                    Criar Usuário
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}