import { Link, Outlet } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, SiteConfig } from '../services/api';

export default function PublicLayout() {
    const [config, setConfig] = useState<SiteConfig | null>(null);

    useEffect(() => {
        api.siteConfig.getPublic().then(setConfig).catch(console.error);
    }, []);

    const appName = config?.appName || 'eSolu - Imóveis';
    const primaryColor = config?.primaryColor || 'blue';

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold bg-clip-text text-transparent" style={{
                            backgroundImage: `linear-gradient(to right, ${getColorHex(primaryColor)}, #3b82f6)`
                        }}>
                            {appName}
                        </span>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            Início
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-white transition-colors shadow-md hover:shadow-lg transform active:scale-95"
                            style={{ backgroundColor: getColorHex(primaryColor) }}
                        >
                            <LogIn size={18} />
                            <span>Entrar</span>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet context={{ config }} />
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-white text-lg font-bold mb-4">{appName}</h3>
                            <p className="text-sm leading-relaxed">
                                Encontre o imóvel dos seus sonhos com agilidade e segurança.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white text-lg font-bold mb-4">Contato</h3>
                            {config?.contactEmail && <p className="text-sm">{config.contactEmail}</p>}
                            {config?.contactPhone && <p className="text-sm">{config.contactPhone}</p>}
                            {config?.contactWhatsApp && <p className="text-sm">WhatsApp: {config.contactWhatsApp}</p>}
                        </div>
                        <div>
                            <h3 className="text-white text-lg font-bold mb-4">Links Úteis</h3>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/login" className="hover:text-white">Área do Corretor</Link></li>
                                <li><Link to="/portal" className="hover:text-white">Portal do Inquilino</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
                        <div>
                            &copy; {new Date().getFullYear()} {appName}. Todos os direitos reservados.
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-slate-500 text-xs text-center">
                                Powered by <a href="https://www.esolu.com.br" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium">eSoluções</a>
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function getColorHex(colorName: string) {
    const colors: Record<string, string> = {
        blue: '#2563eb', // blue-600
        red: '#dc2626', // red-600
        green: '#16a34a', // green-600
        purple: '#9333ea', // purple-600
        orange: '#ea580c', // orange-600
        slate: '#475569', // slate-600
    };
    return colors[colorName] || colors.blue;
}
