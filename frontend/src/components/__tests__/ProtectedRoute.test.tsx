import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

import { useAuth } from '../../contexts/AuthContext';

describe('ProtectedRoute', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('redirects to /login when user is not authenticated', () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            token: null,
            isAuthenticated: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/admin" element={<div>Admin page</div>} />
                    </Route>

                    <Route path="/login" element={<div>Login page</div>} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText('Login page')).toBeInTheDocument();
        expect(screen.queryByText('Admin page')).not.toBeInTheDocument();
    });

    it('renders protected content when user is authenticated', () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {
                id: 'user-1',
                email: 'john@example.com',
                name: 'John Doe',
                role: 'ADMIN',
            },
            token: 'token-123',
            isAuthenticated: true,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/admin" element={<div>Admin page</div>} />
                    </Route>

                    <Route path="/login" element={<div>Login page</div>} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText('Admin page')).toBeInTheDocument();
        expect(screen.queryByText('Login page')).not.toBeInTheDocument();
    });
});