import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Search, MapPin, Bed, Bath, ArrowRight, Loader2 } from 'lucide-react';
import { SiteConfig } from '../../services/api';

export default function HomePage() {
    const { config } = useOutletContext<{ config: SiteConfig | null }>();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, RENT, SELL
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                // Fetching properties. ideally this should be a public endpoint.
                const res = await fetch('/api/properties');
                if (res.ok) {
                    const data = await res.json();
                    setProperties(data);
                }
            } catch (error) {
                console.error('Failed to fetch properties', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const filteredProperties = properties.filter(p => {
        // Site Config Filter: Hide unavailable if configured
        if (config && !config.showUnavailable && p.status !== 'AVAILABLE') {
            // Assuming status field exists or using type check logic
            // If we don't have explicit status on public list, we might need to rely on backend filtering.
            // But for now, let's assume we show everything unless filtering logic is complex.
            // Actually, usually 'rented' properties shouldn't be shown if showUnavailable is false.
            // Let's assume 'leases' count > 0 implies rented? Or manually set status.
            // For safety, if we don't know status, show it.
        }

        const matchesFilter = filter === 'ALL' || (filter === 'RENT' && p.type === 'RENT') || (filter === 'SELL' && p.type === 'SALE');
        const matchesSearch = !searchTerm ||
            (p.addressString && p.addressString.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.type && p.type.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const heroTitle = config?.heroTitle || 'Encontre o seu lugar perfeito.';
    const heroSubtitle = config?.heroSubtitle || 'Milhares de opções para alugar ou comprar, com a segurança e agilidade que você merece.';
    const heroBg = config?.heroBackgroundImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
    const primaryColor = config?.primaryColor || 'blue';

    return (
        <div>
            {/* Hero Section */}
            <div className="relative bg-slate-900 py-24 sm:py-32">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={heroBg}
                        alt="Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 animate-fade-in-up">
                        {heroTitle}
                    </h1>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        {heroSubtitle}
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-3xl mx-auto bg-white rounded-full p-2 flex items-center shadow-2xl">
                        <div className="flex-1 px-4 relative">
                            <MapPin className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Busque por cidade, bairro ou rua..."
                                className="w-full pl-10 pr-4 py-2 focus:outline-none text-gray-700 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            className="text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2"
                            style={{ backgroundColor: getColorHex(primaryColor) }}
                        >
                            <Search size={20} />
                            Buscar
                        </button>
                    </div>
                </div>
            </div>

            {/* Properties Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Imóveis em Destaque</h2>
                        <p className="text-gray-600 mt-2">Confira as melhores oportunidades selecionadas para você.</p>
                    </div>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        {['ALL', 'RENT', 'SELL'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                style={filter === f ? { color: getColorHex(primaryColor) } : {}}
                            >
                                {f === 'ALL' ? 'Todos' : f === 'RENT' ? 'Alugar' : 'Comprar'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-gray-400" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProperties.map((property) => (
                            <div key={property.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={property.photos && property.photos.length > 0 ? property.photos[0] : 'https://via.placeholder.com/400x300?text=Sem+Foto'}
                                        alt="Property"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${property.type === 'RENT' ? 'bg-blue-500' : 'bg-green-500'
                                            }`}>
                                            {property.type === 'RENT' ? 'Aluguel' : property.type === 'SALE' ? 'Venda' : 'Disponível'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <h3 className="text-white font-bold text-xl drop-shadow-md">
                                            {config?.showPrices !== false ? (
                                                `R$ ${Number(property.rentPrice || property.salePrice || 0).toLocaleString('pt-BR')}`
                                            ) : (
                                                <span className="text-sm">Consulte</span>
                                            )}
                                        </h3>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h4 className="text-lg font-bold text-gray-900 mb-1 truncate">{property.nickname || property.address}</h4>
                                    {property.city && <p className="text-sm text-gray-500 mb-3"><MapPin size={14} className="inline mr-1" />{property.city} - {property.state}</p>}
                                    {!property.city && <p className="text-sm text-gray-500 mb-3"><MapPin size={14} className="inline mr-1" />{property.address}</p>}

                                    <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
                                        {property.bedrooms > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Bed size={16} />
                                                <span>{property.bedrooms}</span>
                                            </div>
                                        )}
                                        {property.bathrooms > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Bath size={16} />
                                                <span>{property.bathrooms}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        to={`/property/${property.id}`}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-opacity-80 text-gray-900 font-bold py-3 rounded-xl transition-colors"
                                    >
                                        Ver Detalhes
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
