import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { maintenanceApi } from '../maintenance.api';
import { API_URL } from '../client.api';

describe('maintenanceApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create maintenance with POST and authorization header', async () => {
        const payload = {
            title: 'Fix sink',
            description: 'Kitchen sink leaking',
        };

        const mockResponse = { id: 'maint-1', ...payload };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await maintenanceApi.create(payload, 'token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/maintenance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token-123',
            },
            body: JSON.stringify(payload),
        });

        expect(result).toEqual(mockResponse);
    });

    it('should update maintenance with PATCH', async () => {
        const payload = { title: 'Updated title' };
        const mockResponse = { id: 'maint-1', ...payload };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await maintenanceApi.update('maint-1', payload, 'token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/maintenance/maint-1`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token-123',
            },
            body: JSON.stringify(payload),
        });

        expect(result).toEqual(mockResponse);
    });

    it('should complete maintenance with createInvoice flag', async () => {
        const mockResponse = { success: true };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await maintenanceApi.complete('maint-1', true, 'token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/maintenance/maint-1/complete`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token-123',
            },
            body: JSON.stringify({ createInvoice: true }),
        });

        expect(result).toEqual(mockResponse);
    });

    it('should throw when create fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
        } as unknown as Response);

        await expect(
            maintenanceApi.create({ title: 'Fix sink' }, 'token-123'),
        ).rejects.toThrow('Failed to create maintenance');
    });
});