import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { expensesApi } from '../expenses.api';
import { API_URL } from '../client.api';

describe('expensesApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should fetch expenses with authorization header', async () => {
        const mockResponse = [
            {
                id: 'exp-1',
                description: 'Condomínio',
                amount: 500,
                date: '2026-04-01',
            },
        ];

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await expensesApi.findAll('token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/expenses`, {
            headers: { Authorization: 'Bearer token-123' },
        });

        expect(result).toEqual(mockResponse);
    });

    it('should throw when fetching expenses fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
        } as unknown as Response);

        await expect(expensesApi.findAll('token-123')).rejects.toThrow(
            'Failed to fetch expenses',
        );
    });
});