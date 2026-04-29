import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usersApi } from '../users.api';
import { API_URL } from '../client.api';

describe('usersApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should fetch users with authorization header', async () => {
        const mockResponse = [
            { id: 'user-1', email: 'john@example.com' },
            { id: 'user-2', email: 'jane@example.com' },
        ];

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await usersApi.findAll('token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/users`, {
            headers: { Authorization: 'Bearer token-123' },
        });

        expect(result).toEqual(mockResponse);
    });

    it('should throw when fetching users fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
        } as unknown as Response);

        await expect(usersApi.findAll('token-123')).rejects.toThrow(
            'Failed to fetch users',
        );
    });

    it('me should currently return an empty object', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({}),
        } as unknown as Response);

        const result = await usersApi.me('token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/users/me`, {
            headers: {
                Authorization: 'Bearer token-123',
            },
        });

        expect(result).toEqual({});
    });
});