import { API_URL } from './client.api';

export const expensesApi = {
    findAll: async (token: string) => {
        const res = await fetch(`${API_URL}/expenses`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch expenses');
        }

        return res.json();
    },
};