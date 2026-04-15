import { API_URL } from './client.api';

export const usersApi = {
    findAll: async (token: string) => {
        const res = await fetch(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    me: async (_token: string) => {
        return {};
    },
};