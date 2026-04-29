import { API_URL } from './client.api';

// represents the input used to create one property
export interface PropertyCreateInput {
    code: string;
    nickname?: string;
    address: string;
    city?: string;
    state?: string;
    type: string;
    builtArea: number;
    landArea: number;
    bathrooms?: number;
    bedrooms?: number;
    floors?: number;
    garage?: number;
    basement?: boolean;
    description?: string;
    purchaseDate?: Date;
    purchasePrice?: number;
    isFinanced?: boolean;
    financingTotalValue?: number;
    installmentsCount?: number;
    installmentsPaid?: number;
    financingDueDay?: number;
    financingEndDate?: Date;
    forRent?: boolean;
    rentPrice?: number;
    forSale?: boolean;
    salePrice?: number;
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

export const propertiesApi = {
    // handles finding all public properties
    async findAll() {
        const response = await fetch(`${API_URL}/properties`);
        return handleResponse(response, 'Failed to fetch properties');
    },

    // handles finding one property by id
    async findOne(id: string, token?: string) {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        return handleResponse(response, 'Failed to fetch property');
    },

    // handles creating one property
    async create(data: PropertyCreateInput, token: string) {
        const response = await fetch(`${API_URL}/properties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        return handleResponse(response, 'Failed to create property');
    },

    // handles adding one expense ledger entry to one property
    async addExpense(id: string, data: unknown, token: string) {
        const response = await fetch(`${API_URL}/properties/${id}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        return handleResponse(response, 'Failed to add expense');
    },

    // handles adding one recurring property expense
    async addPropertyExpense(id: string, data: unknown, token: string) {
        const response = await fetch(`${API_URL}/properties/${id}/property-expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        return handleResponse(response, 'Failed to add property expense');
    },

    // handles removing one recurring property expense
    async removePropertyExpense(entryId: string, token: string) {
        const response = await fetch(`${API_URL}/properties/property-expenses/${entryId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response, 'Failed to remove property expense');
    },

    // handles updating one property
    async update(id: string, data: unknown, token: string) {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        return handleResponse(response, 'Failed to update property');
    },

    // handles deleting one property
    async delete(id: string, token: string) {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response, 'Failed to delete property');
    },

    // handles uploading one or more photos to one property
    async uploadPhotos(id: string, files: FileList, token: string) {
        const formData = new FormData();

        Array.from(files).forEach((file) => {
            formData.append('files', file);
        });

        const response = await fetch(`${API_URL}/properties/${id}/photos`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        return handleResponse(response, 'Failed to upload photos');
    },

    // handles uploading one property document
    async uploadDocument(id: string, file: File, title: string, token: string) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);

        const response = await fetch(`${API_URL}/properties/${id}/documents`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        return handleResponse(response, 'Failed to upload document');
    },

    // handles adding one note to one property
    async addNote(id: string, content: string, token: string) {
        const response = await fetch(`${API_URL}/properties/${id}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
        });

        return handleResponse(response, 'Failed to add note');
    },
};