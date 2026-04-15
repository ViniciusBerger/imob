import { API_URL } from './client.api';
import type { LoginCredentials, LoginResponse } from './types';

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (!res.ok) {
            throw new Error('Login failed');
        }

        return res.json();
    },
};