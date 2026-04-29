import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tenantPortalApi } from '../tenant-portal.api';
import { API_URL } from '../client.api';

describe('tenantPortalApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should fetch tenant dashboard with authorization header', async () => {
        const mockDashboard = {
            tenant: {
                id: 'tenant-1',
                name: 'John Tenant',
                email: 'john@example.com',
            },
            activeLease: {
                id: 'lease-1',
                rentDueDay: 5,
                rentValue: 2500,
                endDate: '2027-05-01T00:00:00.000Z',
                property: {
                    address: '123 Main St',
                    nickname: 'Apto Centro',
                },
            },
            openInvoices: [
                {
                    id: 'invoice-1',
                    description: 'Aluguel Maio',
                    dueDate: '2026-05-05T00:00:00.000Z',
                    amount: 2500,
                },
            ],
        };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockDashboard),
        } as unknown as Response);

        const result = await tenantPortalApi.getDashboard('token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/portal/dashboard`, {
            headers: {
                Authorization: 'Bearer token-123',
            },
        });

        expect(result).toEqual(mockDashboard);
    });

    it('should throw a typed error when dashboard request fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 401,
            json: vi.fn().mockResolvedValue({ message: 'Unauthorized' }),
        } as unknown as Response);

        await expect(
            tenantPortalApi.getDashboard('token-123'),
        ).rejects.toMatchObject({
            message: 'Unauthorized',
            status: 401,
        });
    });

    it('should fall back to default error message when response body has no message', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 500,
            json: vi.fn().mockResolvedValue({}),
        } as unknown as Response);

        await expect(
            tenantPortalApi.getDashboard('token-123'),
        ).rejects.toMatchObject({
            message: 'Failed to fetch tenant dashboard',
            status: 500,
        });
    });
});