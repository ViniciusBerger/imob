import { API_URL } from './client.api';

// represents the property summary shown in the tenant portal
interface TenantPortalProperty {
    address: string;
    nickname?: string | null;
}

// represents the active lease shown in the tenant portal
export interface TenantPortalLease {
    id: string;
    rentDueDay?: number | null;
    rentValue: number | string;
    endDate: string;
    property: TenantPortalProperty;
}

// represents one open invoice shown in the tenant portal
export interface TenantPortalInvoice {
    id: string;
    description: string;
    dueDate: string;
    amount: number | string;
}

// represents the tenant profile returned by the tenant portal dashboard
export interface TenantPortalTenant {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    document?: string | null;
}

// represents the full dashboard response for the tenant portal
export interface TenantPortalDashboard {
    tenant: TenantPortalTenant | null;
    activeLease: TenantPortalLease | null;
    openInvoices: TenantPortalInvoice[];
}

// safely reads json bodies when they exist
async function parseJsonSafe(response: Response) {
    return response.json().catch(() => null);
}

// converts failed responses into predictable javascript errors
async function handleResponse<T>(response: Response, defaultMessage: string): Promise<T> {
    if (response.status === 204) {
        return null as T;
    }

    const data = await parseJsonSafe(response);

    if (!response.ok) {
        const error: any = new Error(data?.message || defaultMessage);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data as T;
}

export const tenantPortalApi = {
    // handles loading the tenant portal dashboard
    async getDashboard(token: string): Promise<TenantPortalDashboard> {
        const response = await fetch(`${API_URL}/portal/dashboard`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse<TenantPortalDashboard>(
            response,
            'Failed to fetch tenant dashboard',
        );
    },
};