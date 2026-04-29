const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Guarantor {
    id: string;
    name: string;
    document: string;
    email?: string | null;
    phone?: string | null;
    tenantId?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface GuarantorCreateInput {
    name: string;
    document: string;
    email: string;
    phone: string;
    tenantId?: string;
}

export interface GuarantorUpdateInput {
    name?: string;
    document?: string;
    email?: string;
    phone?: string;
    tenantId?: string;
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

export const guarantorsApi = {
    // handles finding all guarantors
    async findAll(token: string): Promise<Guarantor[]> {
        const response = await fetch(`${API_URL}/guarantors`, {
            headers: buildHeaders(token),
        });

        return handleResponse<Guarantor[]>(response, 'Unable to load guarantors');
    },

    // handles finding one guarantor by id
    async findOne(id: string, token: string): Promise<Guarantor> {
        const response = await fetch(`${API_URL}/guarantors/${id}`, {
            headers: buildHeaders(token),
        });

        return handleResponse<Guarantor>(response, 'Unable to load guarantor');
    },

    // handles creating one guarantor
    async create(data: GuarantorCreateInput, token: string): Promise<Guarantor> {
        const response = await fetch(`${API_URL}/guarantors`, {
            method: 'POST',
            headers: buildHeaders(token, true),
            body: JSON.stringify(data),
        });

        return handleResponse<Guarantor>(response, 'Unable to create guarantor');
    },

    // handles updating one guarantor
    async update(id: string, data: GuarantorUpdateInput, token: string): Promise<Guarantor> {
        const response = await fetch(`${API_URL}/guarantors/${id}`, {
            method: 'PATCH',
            headers: buildHeaders(token, true),
            body: JSON.stringify(data),
        });

        return handleResponse<Guarantor>(response, 'Unable to update guarantor');
    },

    // handles deleting one guarantor
    async remove(id: string, token: string): Promise<void> {
        const response = await fetch(`${API_URL}/guarantors/${id}`, {
            method: 'DELETE',
            headers: buildHeaders(token),
        });

        return await handleResponse<void>(response, 'Unable to delete guarantor');
    },
};