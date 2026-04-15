import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
            json: vi.fn().mockResolvedValue(mockStats),
        } as unknown as Response);

        const result = await statsApi.getDashboard('token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/stats/dashboard`, {
            headers: { Authorization: 'Bearer token-123' },
        });
        expect(result).toEqual(mockStats);
    });

    it('should throw when dashboard stats request fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
        } as unknown as Response);

        await expect(statsApi.getDashboard('token-123')).rejects.toThrow(
            'Failed to fetch dashboard stats',
        );
    });
});