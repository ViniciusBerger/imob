import { API_URL } from './client.api';

export const maintenanceApi = {
    create: async (data: any, token: string) => {
        const res = await fetch(`${API_URL}/maintenance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create maintenance');
        return res.json();
    },

    update: async (id: string, data: any, token: string) => {
        const res = await fetch(`${API_URL}/maintenance/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update maintenance');
        return res.json();
    },

    complete: async (id: string, createInvoice: boolean, token: string) => {
        const res = await fetch(`${API_URL}/maintenance/${id}/complete`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ createInvoice }),
        });
        if (!res.ok) throw new Error('Failed to complete maintenance');
        return res.json();
    },
};