import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { siteConfigApi } from '../site-config.api';
import { API_URL } from '../client.api';

describe('siteConfigApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should fetch public site config', async () => {
        const mockResponse = {
            id: 'config-1',
            appName: 'Real Estate PMS',
            primaryColor: '#000000',
            layoutType: 'default',
            showPrices: true,
            showUnavailable: false,
        };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await siteConfigApi.getPublic();

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/site-config/public`);
        expect(result).toEqual(mockResponse);
    });

    it('should fetch admin site config with authorization header', async () => {
        const mockResponse = {
            id: 'config-1',
            appName: 'Real Estate PMS',
            primaryColor: '#000000',
            layoutType: 'default',
            showPrices: true,
            showUnavailable: false,
        };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await siteConfigApi.getAdmin('token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/site-config/admin`, {
            headers: { Authorization: 'Bearer token-123' },
        });

        expect(result).toEqual(mockResponse);
    });

    it('should update site config with PATCH', async () => {
        const payload = {
            appName: 'Updated PMS',
            primaryColor: '#111111',
        };

        const mockResponse = {
            id: 'config-1',
            appName: 'Updated PMS',
            primaryColor: '#111111',
            layoutType: 'default',
            showPrices: true,
            showUnavailable: false,
        };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await siteConfigApi.update('token-123', payload);

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/site-config`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token-123',
            },
            body: JSON.stringify(payload),
        });

        expect(result).toEqual(mockResponse);
    });

    it('should throw when fetching public config fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
        } as unknown as Response);

        await expect(siteConfigApi.getPublic()).rejects.toThrow(
            'Failed to fetch public config',
        );
    });
});