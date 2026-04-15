import PropertyWizard from '../components/PropertyWizard';
import Layout from '../components/Layout';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreatePropertyPage() {
    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link to="/properties" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
                    <ArrowLeft size={20} />
                    Voltar para Imóveis
                </Link>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Novo Imóvel</h1>
                    <p className="text-gray-500">Preencha as informações abaixo para cadastrar um novo imóvel.</p>
                </div>
                <PropertyWizard />
            </div>
        </Layout>
    );
}
