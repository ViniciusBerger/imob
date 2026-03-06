import { useState, useEffect } from 'react';
import { User, Lock, Save } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setName(data.name);
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            }
        };
        fetchProfile();
    }, [token]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            const body: any = { name };
            if (password) body.password = password;

            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert('Perfil atualizado com sucesso!');
                setPassword('');
                setConfirmPassword('');
                // Optionally update session storage user name
                const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
                sessionStorage.setItem('user', JSON.stringify({ ...storedUser, name }));
            } else {
                alert('Falha ao atualizar perfil.');
            }
        } catch (error) {
            console.error('Error updating profile', error);
        }
    };

    if (!user) return <div>Carregando...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
                <p className="text-gray-600">Gerencie suas informações pessoais e segurança.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (Não editável)</label>
                        <input
                            type="email"
                            disabled
                            value={user.email}
                            className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Deixe em branco para manter a atual"
                                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repita a nova senha"
                                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium shadow-sm hover:shadow"
                        >
                            <Save size={20} />
                            <span>Salvar Alterações</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
