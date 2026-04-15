import { useState, ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Home,
    Users,
    Wallet,
    LogOut,
    Menu,
    User,
    UserCog,
    BarChart3,
    FileText,
    Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
    children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Imóveis', path: '/admin/properties', icon: Home },
        { name: 'Contratos', path: '/admin/contracts', icon: FileText },
        { name: 'Pessoas', path: '/admin/people', icon: Users },
        { name: 'Financeiro', path: '/admin/finance', icon: Wallet },
        { name: 'Relatórios', path: '/admin/reports', icon: BarChart3 },
        { name: 'Usuários', path: '/admin/users', icon: UserCog },
        { name: 'Configurações', path: '/admin/settings/site', icon: Settings },
        { name: 'Perfil', path: '/admin/profile', icon: User },
    ];

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Mobile header */}
            <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm">
                <span className="font-bold text-xl text-primary-700">Real Estate PMS</span>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <Menu className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform transform md:relative md:translate-x-0',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                        Grupo Pargo
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-primary-600 text-white shadow-lg'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                                )}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 bg-gray-50 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children || <Outlet />}
                </div>
            </main>

            {/* Overlay for mobile */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}