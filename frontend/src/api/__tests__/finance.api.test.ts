import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { financeApi } from '../finance.api';
import { API_URL } from '../client.api';

describe('financeApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should fetch finance summary with query params and authorization header', async () => {
        const mockResponse = { totalRevenue: 10000 };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await financeApi.getSummary(
            '2026-01-01',
            '2026-01-31',
            'token-123',
        );

        expect(fetchMock).toHaveBeenCalledWith(
            `${API_URL}/finance/summary?start=2026-01-01&end=2026-01-31`,
            {
                headers: { Authorization: 'Bearer token-123' },
            },
        );

        expect(result).toEqual(mockResponse);
    });

    it('should fetch finance transactions', async () => {
        const mockResponse = [{ id: 'txn-1' }];

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await financeApi.getTransactions('token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/finance/transactions`, {
            headers: { Authorization: 'Bearer token-123' },
        });

        expect(result).toEqual(mockResponse);
    });

    it('should update invoice with PATCH', async () => {
        const payload = { status: 'PAID' };
        const mockResponse = { id: 'inv-1', ...payload };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await financeApi.updateInvoice('inv-1', payload, 'token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/invoices/inv-1`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token-123',
            },
            body: JSON.stringify(payload),
        });

        expect(result).toEqual(mockResponse);
    });

    it('should throw when transactions request fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
        } as unknown as Response);

        await expect(financeApi.getTransactions('token-123')).rejects.toThrow(
            'Failed to fetch transactions',
        );
    });
});