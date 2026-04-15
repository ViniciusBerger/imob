import { API_URL } from './client.api';

export const leasesApi = {
    findAll: async (token: string) => {
        const res = await fetch(`${API_URL}/leases`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch lease contracts');
        return res.json();
    },
};