import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PropertiesPage from './pages/PropertiesPage';
import PeoplePage from './pages/PeoplePage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import PublicPropertyDetailsPage from './pages/public/PublicPropertyDetailsPage';
import FinancePage from './pages/FinancePage';

import CreatePropertyPage from './pages/CreatePropertyPage';
import FinancialReportsPage from './pages/FinancialReportsPage';
import TenantDashboard from './pages/tenant/TenantDashboard';
import SiteSettingsPage from './pages/admin/SiteSettingsPage';
import ContractsPage from './pages/ContractsPage';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/property/:id" element={<PublicPropertyDetailsPage />} />
                    </Route>

                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes (Wrapped in Layout) */}
                    <Route path="/admin" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="properties" element={<PropertiesPage />} />
                        <Route path="properties/new" element={<CreatePropertyPage />} />
                        <Route path="people" element={<PeoplePage />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="finance" element={<FinancePage />} />
                        <Route path="reports" element={<FinancialReportsPage />} />
                        <Route path="settings/site" element={<SiteSettingsPage />} />
                        <Route path="contracts" element={<ContractsPage />} />
                    </Route>

                    {/* Tenant Portal */}
                    <Route path="/portal" element={<TenantDashboard />} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
