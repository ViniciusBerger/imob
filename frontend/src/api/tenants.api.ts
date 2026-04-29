const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Tenant {
    id: string;
    name: string;
    document: string;
    email?: string | null;
    phone?: string | null;
    userId?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface TenantCreateInput {
    name: string;
    document: string;
    email: string;
    phone: string;
}

export interface TenantUpdateInput {
    name?: string;
    document?: string;
    email?: string;
    phone?: string;
}

export interface TenantUserAccessResponse {
    email: string;
    tempPassword: string;
    message?: string;
}

async function parseJsonSafe(response: Response) {
    return response.json().catch(() => null);
}

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

function buildHeaders(token: string, includeJson = false) {
    return {
        ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
    };
}

export const tenantsApi = {
    // handles finding all tenants
    async findAll(token: string): Promise<Tenant[]> {
        const response = await fetch(`${API_URL}/tenants`, {
            headers: buildHeaders(token),
        });

        return handleResponse<Tenant[]>(response, 'Unable to load tenants');
    },

    // handles finding one tenant by id
    async findOne(id: string, token: string): Promise<Tenant> {
        const response = await fetch(`${API_URL}/tenants/${id}`, {
            headers: buildHeaders(token),
        });

        return handleResponse<Tenant>(response, 'Unable to load tenant');
    },

    // handles creating one tenant
    async create(data: TenantCreateInput, token: string): Promise<Tenant> {
        const response = await fetch(`${API_URL}/tenants`, {
            method: 'POST',
            headers: buildHeaders(token, true),
            body: JSON.stringify(data),
        });

        return handleResponse<Tenant>(response, 'Unable to create tenant');
    },

    // handles updating one tenant
    async update(id: string, data: TenantUpdateInput, token: string): Promise<Tenant> {
        const response = await fetch(`${API_URL}/tenants/${id}`, {
            method: 'PATCH',
            headers: buildHeaders(token, true),
            body: JSON.stringify(data),
        });

        return handleResponse<Tenant>(response, 'Unable to update tenant');
    },

    // handles deleting one tenant
    async remove(id: string, token: string): Promise<void> {
        const response = await fetch(`${API_URL}/tenants/${id}`, {
            method: 'DELETE',
            headers: buildHeaders(token),
        });

        return await handleResponse<void>(response, 'Unable to delete tenant');
    },

    // handles creating one tenant user access
    async createUser(id: string, token: string): Promise<TenantUserAccessResponse> {
        const response = await fetch(`${API_URL}/tenants/${id}/user`, {
            method: 'POST',
            headers: buildHeaders(token),
        });

        return handleResponse<TenantUserAccessResponse>(response, 'Unable to create tenant user');
    },
};