import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authApi } from '../auth.api';
import { API_URL } from '../client.api';

describe('authApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should post login credentials and return login response', async () => {
        const mockResponse = {
            access_token: 'token-123',
            user: {
                id: 'user-1',
                email: 'john@example.com',
                name: 'John Doe',
                role: 'ADMIN',
            },
        };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await authApi.login({
            email: 'john@example.com',
            password: '123456',
        });

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'john@example.com',
                password: '123456',
            }),
        });

        expect(result).toEqual(mockResponse);
    });

    it('should throw when login fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
        } as unknown as Response);

        await expect(
            authApi.login({
                email: 'john@example.com',
                password: 'wrong-password',
            }),
        ).rejects.toThrow('Login failed');
    });
});