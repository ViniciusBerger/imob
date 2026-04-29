import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { guarantorsApi } from '../guarantors.api';
import { API_URL } from '../client.api';

describe('guarantorsApi', () => {
    const token = 'test-token';
    const fetchMock = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
    });

    it('should find all guarantors', async () => {
        const guarantors = [
            { id: '1', name: 'Guarantor One', document: '123' },
            { id: '2', name: 'Guarantor Two', document: '456' },
        ];

        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(guarantors),
        });

        const result = await guarantorsApi.findAll(token);

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/guarantors`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        expect(result).toEqual(guarantors);
    });

    it('should find one guarantor by id', async () => {
        const guarantor = { id: '1', name: 'Guarantor One', document: '123' };

        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(guarantor),
        });

        const result = await guarantorsApi.findOne('1', token);

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/guarantors/1`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        expect(result).toEqual(guarantor);
    });

    it('should create one guarantor', async () => {
        const payload = {
            name: 'Guarantor One',
            document: '123',
            email: 'guarantor@example.com',
            phone: '555-1111',
            tenantId: 'tenant-1',
        };

        const created = { id: '1', ...payload };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 201,
            json: vi.fn().mockResolvedValue(created),
        } as unknown as Response);

        const result = await guarantorsApi.create(payload, token);

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/guarantors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        expect(result).toEqual(created);
    });

    it('should update one guarantor', async () => {
        const payload = {
            phone: '555-2222',
            tenantId: 'tenant-2',
        };

        const updated = {
            id: '1',
            name: 'Guarantor One',
            document: '123',
            email: 'guarantor@example.com',
            ...payload,
        };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(updated),
        } as unknown as Response);

        const result = await guarantorsApi.update('1', payload, token);

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/guarantors/1`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        expect(result).toEqual(updated);
    });

    it('should delete one guarantor', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 204,
            json: vi.fn(),
        } as unknown as Response);

        const result = await guarantorsApi.remove('1', token);

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/guarantors/1`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        expect(result).toBeNull();
    });

    it('should throw a typed error when request fails', async () => {
        fetchMock.mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Guarantor already exists' }),
        });

        await expect(
            guarantorsApi.create(
                {
                    name: 'Guarantor One',
                    document: '123',
                    email: 'guarantor@example.com',
                    phone: '555-1111',
                },
                token,
            ),
        ).rejects.toMatchObject({
            message: 'Guarantor already exists',
            status: 400,
        });
    });
});