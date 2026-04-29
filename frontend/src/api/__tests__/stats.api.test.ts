import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { statsApi } from '../stats.api';
import { API_URL } from '../client.api';

describe('statsApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should fetch dashboard stats with authorization header', async () => {
        const mockStats = {
            totalProperties: 10,
            availableProperties: 4,
            rentedProperties: 6,
            occupancyRate: 60,
            alerts: {
                expiringContracts: [],
            },
        };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockStats),
        } as unknown as Response);

        const result = await statsApi.getDashboard('token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/stats/dashboard`, {
            headers: { Authorization: 'Bearer token-123' },
        });
        expect(result).toEqual(mockStats);
    });

    it('should throw a typed error when dashboard stats request fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 500,
            json: vi.fn().mockResolvedValue({ message: 'Failed to fetch dashboard stats' }),
        } as unknown as Response);

        await expect(statsApi.getDashboard('token-123')).rejects.toMatchObject({
            message: 'Failed to fetch dashboard stats',
            status: 500,
        });
    });

    it('should fetch DRE report with authorization header and query params', async () => {
        const mockDre = {
            period: {
                start: '2026-01-01T00:00:00.000Z',
                end: '2026-06-01T00:00:00.000Z',
            },
            grossRevenue: 10000,
            taxes: 500,
            netRevenue: 9500,
            operatingExpenses: 3000,
            netIncome: 6500,
        };

        const startDate = '2026-01-01T00:00:00.000Z';
        const endDate = '2026-06-01T00:00:00.000Z';

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockDre),
        } as unknown as Response);

        const result = await statsApi.getDreReport('token-123', startDate, endDate);

        expect(fetchMock).toHaveBeenCalledWith(
            `${API_URL}/stats/reports/dre?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
            {
                headers: { Authorization: 'Bearer token-123' },
            },
        );
        expect(result).toEqual(mockDre);
    });

    it('should throw a typed error when DRE report request fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Invalid date range' }),
        } as unknown as Response);

        await expect(
            statsApi.getDreReport(
                'token-123',
                '2026-01-01T00:00:00.000Z',
                '2026-06-01T00:00:00.000Z',
            ),
        ).rejects.toMatchObject({
            message: 'Invalid date range',
            status: 400,
        });
    });

    it('should fetch projection report with authorization header', async () => {
        const mockProjection = [
            {
                month: 'janeiro',
                inflow: 5000,
                outflow: 2000,
                balance: 3000,
            },
            {
                month: 'fevereiro',
                inflow: 5200,
                outflow: 2200,
                balance: 3000,
            },
        ];

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockProjection),
        } as unknown as Response);

        const result = await statsApi.getProjectionReport('token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/stats/reports/projection`, {
            headers: { Authorization: 'Bearer token-123' },
        });
        expect(result).toEqual(mockProjection);
    });

    it('should throw a typed error when projection report request fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 500,
            json: vi.fn().mockResolvedValue({ message: 'Failed to fetch projection report' }),
        } as unknown as Response);

        await expect(statsApi.getProjectionReport('token-123')).rejects.toMatchObject({
            message: 'Failed to fetch projection report',
            status: 500,
        });
    });
});