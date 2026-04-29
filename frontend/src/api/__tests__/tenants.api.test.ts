import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tenantsApi } from '../tenants.api';
import { API_URL } from '../client.api';

describe('tenantsApi', () => {
    const token = 'test-token';
    const fetchMock = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
    });

    it('should find all tenants', async () => {
        const tenants = [
            { id: '1', name: 'John Doe', document: '123' },
            { id: '2', name: 'Jane Doe', document: '456' },
        ];

        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(tenants),
        });

        const result = await tenantsApi.findAll(token);

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/tenants`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        expect(result).toEqual(tenants);
    });

    it('should find one tenant by id', async () => {
        const tenant = { id: '1', name: 'John Doe', document: '123' };

        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(tenant),
        });

        const result = await tenantsApi.findOne('1', token);

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/tenants/1`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        expect(result).toEqual(tenant);
    });

    it('should create one tenant', async () => {
        const payload = {
            name: 'John Doe',
            document: '123',
            email: 'john@example.com',
            phone: '555-1111',
        };

        const created = { id: '1', ...payload };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 201,
            json: vi.fn().mockResolvedValue(created),
        } as unknown as Response);

        const result = await tenantsApi.create(payload, token);

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/tenants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        expect(result).toEqual(created);
    });

    it('should update one tenant', async () => {
        const payload = {
            name: 'John Updated',
            phone: '555-2222',
        };

        const updated = {
            id: '1',
            document: '123',
            email: 'john@example.com',
            ...payload,
        };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(updated),
        } as unknown as Response);

        const result = await tenantsApi.update('1', payload, token);

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/tenants/1`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        expect(result).toEqual(updated);
    });

    it('should delete one tenant', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 204,
            json: vi.fn(),
        } as unknown as Response);

        const result = await tenantsApi.remove('1', token);

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/tenants/1`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        expect(result).toBeNull();
    });

    it('should create tenant user access', async () => {
        const credentials = {
            email: 'john@example.com',
            tempPassword: 'temp-123',
        };

        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(credentials),
        });

        const result = await tenantsApi.createUser('1', token);

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/tenants/1/user`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        expect(result).toEqual(credentials);
    });

    it('should throw a typed error when request fails', async () => {
        fetchMock.mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Tenant already exists' }),
        });

        await expect(tenantsApi.createUser('1', token)).rejects.toMatchObject({
            message: 'Tenant already exists',
            status: 400,
        });
    });
});