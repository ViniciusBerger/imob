import { API_URL } from './client.api';

export const financeApi = {
    getSummary: async (start: string, end: string, token: string) => {
        const res = await fetch(`${API_URL}/finance/summary?start=${start}&end=${end}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch finance summary');
        return res.json();
    },

    getTransactions: async (token: string) => {
        const res = await fetch(`${API_URL}/finance/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
    },

    updateInvoice: async (id: string, data: any, token: string) => {
        const res = await fetch(`${API_URL}/invoices/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update invoice');
        return res.json();
    },
};