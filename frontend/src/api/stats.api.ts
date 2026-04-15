import { API_URL } from './client.api';
import type { DashboardStats } from './types';

export const statsApi = {
    getDashboard: async (token: string): Promise<DashboardStats> => {
        const res = await fetch(`${API_URL}/stats/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        return res.json();
    },
};