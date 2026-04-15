import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { leasesApi } from '../leases.api';
import { API_URL } from '../client.api';

describe('leasesApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should fetch leases with authorization header', async () => {
        const mockData = [{ id: 'lease-1' }];

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockData),
        } as unknown as Response);

        const result = await leasesApi.findAll('token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/leases`, {
            headers: { Authorization: 'Bearer token-123' },
        });
        expect(result).toEqual(mockData);
    });

    it('should throw when fetching leases fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
        } as unknown as Response);

        await expect(leasesApi.findAll('token-123')).rejects.toThrow(
            'Failed to fetch lease contracts',
        );
    });
});