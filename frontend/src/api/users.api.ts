import { API_URL } from './client.api';
import { CreateUserPayload, UserListItem } from './types';


export const usersApi = {
    findAll: async (token: string): Promise<UserListItem[]> => {
        const res = await fetch(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    create: async (data: CreateUserPayload, token: string) => {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error('Failed to create user');
        return res.json();
    },

    me: async (token: string) => {
        const res = await fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch current user');
        return res.json();
    },

    update: async (
    id: string,
    data: { name?: string; email?: string; password?: string; role?: string },
    token: string,
) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
},
};