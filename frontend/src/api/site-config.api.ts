import { API_URL } from './client.api';
import type { SiteConfig, UpdateSiteConfigDto } from './types';

export const siteConfigApi = {
    getPublic: async (): Promise<SiteConfig> => {
        const res = await fetch(`${API_URL}/site-config/public`);
        if (!res.ok) throw new Error('Failed to fetch public config');
        return res.json();
    },

    getAdmin: async (token: string): Promise<SiteConfig> => {
        const res = await fetch(`${API_URL}/site-config/admin`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch admin config');
        return res.json();
    },

    update: async (token: string, data: UpdateSiteConfigDto): Promise<SiteConfig> => {
        const res = await fetch(`${API_URL}/site-config`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update config');
        return res.json();
    },
};