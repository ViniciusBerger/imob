import { API_URL } from './client.api';
import type { DashboardStats } from './types';

// represents the period metadata returned by the DRE report
export interface DreReportPeriod {
    start: string;
    end: string;
}

// represents the DRE report payload
export interface DreReport {
    period: DreReportPeriod;
    grossRevenue: number;
    taxes: number;
    netRevenue: number;
    operatingExpenses: number;
    netIncome: number;
}

// represents one projection row returned by the cash flow report
export interface ProjectionReportRow {
    month: string;
    inflow: number;
    outflow: number;
    balance: number;
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

export const statsApi = {
    // handles loading dashboard stats
    async getDashboard(token: string): Promise<DashboardStats> {
        const response = await fetch(`${API_URL}/stats/dashboard`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse<DashboardStats>(response, 'Failed to fetch dashboard stats');
    },

    // handles loading the DRE report for a date range
    async getDreReport(token: string, startDate: string, endDate: string): Promise<DreReport> {
        const params = new URLSearchParams({
            startDate,
            endDate,
        });

        const response = await fetch(`${API_URL}/stats/reports/dre?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse<DreReport>(response, 'Failed to fetch DRE report');
    },

    // handles loading the cash flow projection report
    async getProjectionReport(token: string): Promise<ProjectionReportRow[]> {
        const response = await fetch(`${API_URL}/stats/reports/projection`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse<ProjectionReportRow[]>(
            response,
            'Failed to fetch projection report',
        );
    },
};