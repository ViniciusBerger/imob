export const API_URL = import.meta.env.VITE_API_URL || '/api';

// Types
export interface SiteConfig {
    id: string;
    appName: string;
    seoTitle?: string;
    seoDescription?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroBackgroundImage?: string;
    contactPhone?: string;
    contactEmail?: string;
    contactWhatsApp?: string;
    primaryColor: string;
    layoutType: string;
    showPrices: boolean;
    showUnavailable: boolean;
    logoUrl?: string;
    faviconUrl?: string;
}

export interface UpdateSiteConfigDto extends Partial<SiteConfig> { }

export interface PropertyExpense {
    id: string;
    name: string;
    value: number | string;
    frequency: 'MONTHLY' | 'YEARLY' | 'ONCE' | 'CUSTOM';
    dueDateDay?: number;
    active: boolean;
    autoGenerate: boolean;
}

export interface Property {
    id: string;
    code: string;
    address: string;
    type: string;
    rentPrice?: number;
    salePrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    garage?: number;
    area?: number;
    description?: string;
    photos: string[];
    leases?: any[];
    documents?: any[];
    maintenances?: any[];
    notes?: any[];
    status?: string; // Derived or field

    // Added from Schema
    nickname?: string;
    city?: string;
    state?: string;
    propertyExpenses?: any[];
}

export interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    description: string;
    amount: number;
    date: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    category?: string;
    propertyId?: string;
    property?: { address: string };
}

// API Service
export const api = {
    auth: {
        login: async (credentials: any) => {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            if (!res.ok) throw new Error('Login failed');
            return res.json();
        },
        // Add forgot/reset password if needed
    },

    properties: {
        findAll: async () => {
            // Public or protected based on usage. 
            // Ideally protected for admin listing, but we used same generic list.
            const res = await fetch(`${API_URL}/properties`);
            if (!res.ok) throw new Error('Failed to fetch properties');
            return res.json();
        },
        findOne: async (id: string, token: string) => {
            const res = await fetch(`${API_URL}/properties/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch property');
            return res.json();
        },
        create: async (data: any, token: string) => {
            const res = await fetch(`${API_URL}/properties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create property');
            return res.json();
        },
        addExpense: async (id: string, data: any, token: string) => {
            const res = await fetch(`${API_URL}/properties/${id}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to add expense');
            return res.json();
        },
        addPropertyExpense: async (id: string, data: any, token: string) => {
            const res = await fetch(`${API_URL}/properties/${id}/property-expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to add property expense');
            return res.json();
        },
        removePropertyExpense: async (entry_id: string, token: string) => {
            const res = await fetch(`${API_URL}/properties/property-expenses/${entry_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to remove property expense');
            return res.json();
        },
        update: async (id: string, data: any, token: string) => {
            const res = await fetch(`${API_URL}/properties/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update property');
            return res.json();
        },
        delete: async (id: string, token: string) => {
            const res = await fetch(`${API_URL}/properties/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete property');
            return res.json();
        },
        uploadPhotos: async (id: string, files: FileList, token: string) => {
            const formData = new FormData();
            Array.from(files).forEach(file => formData.append('files', file));

            const res = await fetch(`${API_URL}/properties/${id}/photos`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (!res.ok) throw new Error('Failed to upload photos');
            return res.json();
        },
        uploadDocument: async (id: string, file: File, title: string, token: string) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);

            const res = await fetch(`${API_URL}/properties/${id}/documents`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (!res.ok) throw new Error('Failed to upload document');
            return res.json();
        },
        addNote: async (id: string, content: string, userId: string, token: string) => {
            const res = await fetch(`${API_URL}/properties/${id}/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content, userId })
            });
            if (!res.ok) throw new Error('Failed to add note');
            return res.json();
        }
    },

    maintenance: {
        create: async (data: any, token: string) => {
            const res = await fetch(`${API_URL}/maintenance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create maintenance');
            return res.json();
        },
        update: async (id: string, data: any, token: string) => {
            const res = await fetch(`${API_URL}/maintenance/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update maintenance');
            return res.json();
        },
        complete: async (id: string, createInvoice: boolean, token: string) => {
            const res = await fetch(`${API_URL}/maintenance/${id}/complete`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ createInvoice })
            });
            if (!res.ok) throw new Error('Failed to complete maintenance');
            return res.json();
        }
    },

    contracts: {
        findAll: async (token: string) => {
            const res = await fetch(`${API_URL}/contracts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch contracts');
            return res.json();
        }
    },

    finance: {
        getSummary: async (start: string, end: string, token: string) => {
            const res = await fetch(`${API_URL}/finance/summary?start=${start}&end=${end}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch finance summary');
            return res.json();
        },
        getTransactions: async (token: string) => {
            const res = await fetch(`${API_URL}/finance/transactions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch transactions');
            return res.json();
        },
        updateInvoice: async (id: string, data: any, token: string) => {
            // Assuming endpoint is invoices or within finance
            // Based on Invoice model, we might have InvoicesController
            const res = await fetch(`${API_URL}/invoices/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update invoice');
            return res.json();
        }
    },

    stats: {
        getDashboard: async (token: string) => {
            const res = await fetch(`${API_URL}/stats/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch dashboard stats');
            return res.json();
        }
    },

    dashboard: {
        getStats: async (token: string) => {
            const res = await fetch(`${API_URL}/dashboard/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                // Fallback if dashboard endpoint doesn't exist yet, return mocks or empty
                console.warn("Dashboard stats endpoint might be missing");
                return {};
            }
            return res.json();
        }
    },

    users: {
        findAll: async (token: string) => {
            const res = await fetch(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
        },
        me: async (token: string) => {
            // Often might not exist, but let's assume it does or use list
            return {};
        }
    },

    siteConfig: {
        getPublic: async (): Promise<SiteConfig> => {
            const res = await fetch(`${API_URL}/site-config/public`);
            if (!res.ok) throw new Error('Failed to fetch public config');
            return res.json();
        },
        getAdmin: async (token: string): Promise<SiteConfig> => {
            const res = await fetch(`${API_URL}/site-config/admin`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch admin config');
            return res.json();
        },
        update: async (token: string, data: UpdateSiteConfigDto): Promise<SiteConfig> => {
            const res = await fetch(`${API_URL}/site-config`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update config');
            return res.json();
        }
    }
}


export interface DashboardStats {
    totalProperties: number;
    availableProperties: number;
    rentedProperties: number;
    occupancyRate: number;

    financials?: {
        totalRevenue: number;
        totalFixedCosts: number;
        netIncome: number;

        patrimony: {
            assets: number;
            liabilities: number;
            netWorth: number;
        };

        cashFlow: {
            projectedIncome: number;
            realizedIncome: number;
            projectedExpenses: number;
            realizedExpenses: number;
        };
    };

    alerts: {
        expiringContracts: Array<{
            id: string;
            propertyCode: string;
            propertyTitle: string;
            endDate: string;
        }>;
    };
}
