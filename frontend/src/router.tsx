import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PropertiesPage from './pages/PropertiesPage';
import PeoplePage from './pages/PeoplePage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import PublicPropertyDetailsPage from './pages/public/PublicPropertyDetailsPage';
import FinancePage from './pages/FinancePage';
import CreatePropertyPage from './pages/CreatePropertyPage';
import FinancialReportsPage from './pages/FinancialReportsPage';
import TenantDashboard from './pages/tenant/TenantDashboard';
import SiteSettingsPage from './pages/admin/SiteSettingsPage';
import ContractsPage from './pages/ContractsPage';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
    {
        element: <PublicLayout />,
        children: [
            { path: '/', element: <HomePage /> },
            { path: '/property/:id', element: <PublicPropertyDetailsPage /> },
        ],
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    // protected routes
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/admin',
                element: <Layout />,
                children: [
                    { index: true, element: <Dashboard /> },
                    { path: 'properties', element: <PropertiesPage /> },
                    { path: 'properties/new', element: <CreatePropertyPage /> },
                    { path: 'people', element: <PeoplePage /> },
                    { path: 'users', element: <UsersPage /> },
                    { path: 'profile', element: <ProfilePage /> },
                    { path: 'finance', element: <FinancePage /> },
                    { path: 'reports', element: <FinancialReportsPage /> },
                    { path: 'settings/site', element: <SiteSettingsPage /> },
                    { path: 'contracts', element: <ContractsPage /> },
                ],
            },
            // portal route
            {
                path: '/portal',
                element: <TenantDashboard />,
            },
        ],
    },

    // fallback for unknown URL
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);