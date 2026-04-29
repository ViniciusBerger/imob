import { API_URL } from './client.api';

// represents one property summary attached to an invoice
interface InvoicePropertySummary {
    code?: string | null;
    nickname?: string | null;
    address?: string | null;
}

// represents one lease summary attached to an invoice
interface InvoiceLeaseSummary {
    id: string;
    property?: InvoicePropertySummary | null;
    tenant?: {
        name: string;
    } | null;
}

// represents one invoice used by finance components
export interface InvoiceListItem {
    id: string;
    description: string;
    dueDate?: string | null;
    amount: number | string;
    status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | string;
    paidAt?: string | null;
    paidAmount?: number | string | null;
    type?: 'RECEIVABLE' | 'PAYABLE' | string;
    approvalStatus?: string | null;
    property?: InvoicePropertySummary | null;
    lease?: InvoiceLeaseSummary | null;
}

// represents the available list filters for invoice queries
export interface InvoiceListFilters {
    type?: 'PAYABLE' | 'RECEIVABLE';
    leaseId?: string;
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

export const invoicesApi = {
    // handles finding invoices with optional list filters
    async findAll(token: string, filters?: InvoiceListFilters): Promise<InvoiceListItem[]> {
        const params = new URLSearchParams();

        if (filters?.type) {
            params.append('type', filters.type);
        }

        if (filters?.leaseId) {
            params.append('leaseId', filters.leaseId);
        }

        const queryString = params.toString();
        const url = queryString ? `${API_URL}/invoices?${queryString}` : `${API_URL}/invoices`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse<InvoiceListItem[]>(response, 'Failed to fetch invoices');
    },

    // handles approving one invoice payment
    async approve(id: string, token: string): Promise<unknown> {
        const response = await fetch(`${API_URL}/invoices/${id}/approve`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return handleResponse(response, 'Failed to approve invoice');
    },

    // handles updating one invoice
    async update(id: string, data: unknown, token: string): Promise<unknown> {
        const response = await fetch(`${API_URL}/invoices/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        return handleResponse(response, 'Failed to update invoice');
    },

    // handles marking one invoice as paid
    async pay(id: string, amount: number, token: string): Promise<unknown> {
        const response = await fetch(`${API_URL}/invoices/${id}/pay`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount }),
        });

        return handleResponse(response, 'Failed to pay invoice');
    },
};