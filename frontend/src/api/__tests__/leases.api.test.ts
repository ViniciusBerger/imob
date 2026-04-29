import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
            status: 200,
            json: vi.fn().mockResolvedValue(mockData),
        } as unknown as Response);

        const result = await leasesApi.findAll('token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/leases`, {
            headers: { Authorization: 'Bearer token-123' },
        });
        expect(result).toEqual(mockData);
    });

    it('should throw a typed error when fetching leases fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 500,
            json: vi.fn().mockResolvedValue({ message: 'Failed to fetch lease contracts' }),
        } as unknown as Response);

        await expect(leasesApi.findAll('token-123')).rejects.toMatchObject({
            message: 'Failed to fetch lease contracts',
            status: 500,
        });
    });

    it('should create one lease with authorization header and payload', async () => {
        const payload = {
            propertyId: 'property-1',
            tenantId: 'tenant-1',
            guarantorId: 'guarantor-1',
            startDate: '2026-05-01T00:00:00.000Z',
            endDate: '2027-05-01T00:00:00.000Z',
            rentValue: 2500,
            type: 'RENT' as const,
            autoRenew: true,
            adjustmentRate: 5,
            rentDueDay: 5,
        };

        const createdLease = {
            id: 'lease-1',
            ...payload,
        };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 201,
            json: vi.fn().mockResolvedValue(createdLease),
        } as unknown as Response);

        const result = await leasesApi.create(payload, 'token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/leases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token-123',
            },
            body: JSON.stringify(payload),
        });
        expect(result).toEqual(createdLease);
    });

    it('should throw a typed error when creating a lease fails', async () => {
        const payload = {
            propertyId: 'property-1',
            tenantId: 'tenant-1',
            startDate: '2026-05-01T00:00:00.000Z',
            endDate: '2027-05-01T00:00:00.000Z',
            rentValue: 2500,
            type: 'RENT' as const,
        };

        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Tenant is required' }),
        } as unknown as Response);

        await expect(leasesApi.create(payload, 'token-123')).rejects.toMatchObject({
            message: 'Tenant is required',
            status: 400,
        });
    });
});