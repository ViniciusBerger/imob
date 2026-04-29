import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { propertiesApi } from '../properties.api';
import { API_URL } from '../client.api';

describe('propertiesApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('addNote should send only content in the request body', async () => {
        const mockResponse = { id: 'note-1', content: 'Test note' };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 201,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await propertiesApi.addNote(
            'property-1',
            'Test note',
            'token-123',
        );

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/properties/property-1/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token-123',
            },
            body: JSON.stringify({ content: 'Test note' }),
        });

        const [, options] = fetchMock.mock.calls[0];
        expect((options as RequestInit).body).not.toContain('userId');

        expect(result).toEqual(mockResponse);
    });

    it('addNote should throw a typed error when request fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Failed to add note' }),
        } as unknown as Response);

        await expect(
            propertiesApi.addNote('property-1', 'Test note', 'token-123'),
        ).rejects.toMatchObject({
            message: 'Failed to add note',
            status: 400,
        });
    });

    it('findOne should fetch property with authorization header', async () => {
        const mockProperty = { id: 'property-1', address: '123 Main St' };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockProperty),
        } as unknown as Response);

        const result = await propertiesApi.findOne('property-1', 'token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/properties/property-1`, {
            headers: { Authorization: 'Bearer token-123' },
        });
        expect(result).toEqual(mockProperty);
    });

    it('delete should use DELETE method and authorization header', async () => {
        const mockResponse = { success: true };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await propertiesApi.delete('property-1', 'token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/properties/property-1`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer token-123' },
        });
        expect(result).toEqual(mockResponse);
    });

    it('delete should support 204 responses without json body', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 204,
            json: vi.fn(),
        } as unknown as Response);

        const result = await propertiesApi.delete('property-1', 'token-123');

        expect(result).toBeNull();
    });
});