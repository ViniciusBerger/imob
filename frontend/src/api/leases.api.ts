import { API_URL } from './client.api';

// represents the input used to create one lease contract
export interface LeaseCreateInput {
    propertyId: string;
    tenantId: string;
    guarantorId?: string;
    startDate: string;
    endDate: string;
    rentValue: number;
    type: 'RENT' | 'SALE';
    autoRenew?: boolean;
    adjustmentRate?: number;
    rentDueDay?: number;
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

export const leasesApi = {
    // handles finding all lease contracts
    async findAll(token: string) {
        const response = await fetch(`${API_URL}/leases`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response, 'Failed to fetch lease contracts');
    },

    // handles creating one lease contract
    async create(data: LeaseCreateInput, token: string) {
        const response = await fetch(`${API_URL}/leases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        return handleResponse(response, 'Failed to create lease contract');
    },
};