import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, ArrowLeft, MessageCircle, Maximize, Ruler } from 'lucide-react';
import { api, type Property } from '../../api';

type PublicProperty = Property & {
    addressString?: string;
    value?: number | string;
    builtArea?: number | string;
    landArea?: number | string;
};

export default function PublicPropertyDetailsPage() {
    const { id } = useParams();
    const [property, setProperty] = useState<PublicProperty | null>(null);

    useEffect(() => {
        const fetchProperty = async () => {
            if (!id) return;

            try {
                const data = await api.properties.findOne(id);
                setProperty(data);
            } catch (error) {
                console.error('Failed to fetch property details', error);
            }
        };

        fetchProperty();
    }, [id]);

    if (!property) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

    const displayAddress = property.addressString || property.address;
    const displayValue = property.value || property.rentPrice || property.salePrice || 0;

    const whatsappMessage = `Olá! Gostaria de saber mais sobre o imóvel em ${displayAddress} (ID: ${property.id}).`;
    const whatsappLink = `https://wa.me/5551998861124?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <div className="bg-white pb-12">
            {/* Header / Breadcrumb */}
            <div className="bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-4">
                        <ArrowLeft size={20} />
                        Voltar para a busca
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{displayAddress}</h1>
                    <div className="flex items-center gap-2 text-gray-500 mt-2">
                        <MapPin size={18} />
                        <span>{property.city || 'Cidade não informada'} - {property.state || 'UF'}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Photos Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-2xl overflow-hidden shadow-lg h-[400px] md:h-[500px]">
                            <img
                                src={property.photos && property.photos.length > 0 ? property.photos[0] : 'https://via.placeholder.com/800x600?text=Sem+Foto'}
                                alt="Main View"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {property.photos && property.photos.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {property.photos.slice(1, 5).map((photo: string, index: number) => (
                                    <div key={index} className="rounded-xl overflow-hidden h-24 shadow-sm cursor-pointer hover:opacity-90">
                                        <img src={photo} alt={`View ${index + 2}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Column */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <div className="mb-6">
                                <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider">
                                    Valor do {property.type === 'RENT' ? 'Aluguel' : 'Venda'}
                                </span>
                                <div className="text-4xl font-bold text-primary-600 mt-1">
                                    R$ {Number(displayValue).toLocaleString('pt-BR')}
                                </div>
                            </div>

                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1 mb-4"
                            >
                                <MessageCircle size={24} />
                                Chamar no WhatsApp
                            </a>
                        </div>

                        {/* Details */}
                        <div className="prose prose-blue max-w-none">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Sobre o Imóvel</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Bed className="text-primary-500" size={20} />
                                    <span className="font-semibold">{property.bedrooms || 0} Quartos</span>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Bath className="text-primary-500" size={20} />
                                    <span className="font-semibold">{property.bathrooms || 0} Banheiros</span>
                                </div>

                                {property.builtArea && (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Maximize className="text-primary-500" size={20} />
                                        <span className="font-semibold">{property.builtArea} m² Útil</span>
                                    </div>
                                )}

                                {property.landArea && (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Ruler className="text-primary-500" size={20} />
                                        <span className="font-semibold">{property.landArea} m² Total</span>
                                    </div>
                                )}
                            </div>

                            {property.description && (
                                <div className="mt-6">
                                    <h4 className="font-bold text-gray-900 mb-2">Descrição</h4>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}