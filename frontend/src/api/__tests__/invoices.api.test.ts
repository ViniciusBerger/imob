import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { invoicesApi } from '../invoices.api';
import { API_URL } from '../client.api';

describe('invoicesApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should fetch invoices with authorization header', async () => {
        const mockInvoices = [
            {
                id: 'invoice-1',
                description: 'Aluguel Maio',
                amount: 2500,
                dueDate: '2026-05-05T00:00:00.000Z',
                approvalStatus: 'PENDING',
                property: { code: 'APT-101' },
            },
        ];

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockInvoices),
        } as unknown as Response);

        const result = await invoicesApi.findAll('token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/invoices`, {
            headers: {
                Authorization: 'Bearer token-123',
            },
        });
        expect(result).toEqual(mockInvoices);
    });

    it('should fetch invoices with filters', async () => {
        const mockInvoices = [
            {
                id: 'invoice-1',
                description: 'Aluguel Maio',
                amount: 2500,
                type: 'RECEIVABLE',
            },
        ];

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockInvoices),
        } as unknown as Response);

        const result = await invoicesApi.findAll('token-123', {
            type: 'RECEIVABLE',
            leaseId: 'lease-1',
        });

        expect(fetchMock).toHaveBeenCalledWith(
            `${API_URL}/invoices?type=RECEIVABLE&leaseId=lease-1`,
            {
                headers: {
                    Authorization: 'Bearer token-123',
                },
            },
        );
        expect(result).toEqual(mockInvoices);
    });

    it('should throw a typed error when fetching invoices fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 500,
            json: vi.fn().mockResolvedValue({ message: 'Failed to fetch invoices' }),
        } as unknown as Response);

        await expect(invoicesApi.findAll('token-123')).rejects.toMatchObject({
            message: 'Failed to fetch invoices',
            status: 500,
        });
    });

    it('should approve one invoice with authorization header', async () => {
        const mockResponse = { success: true };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await invoicesApi.approve('invoice-1', 'token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/invoices/invoice-1/approve`, {
            method: 'PATCH',
            headers: {
                Authorization: 'Bearer token-123',
                'Content-Type': 'application/json',
            },
        });
        expect(result).toEqual(mockResponse);
    });

    it('should throw a typed error when approving one invoice fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Failed to approve invoice' }),
        } as unknown as Response);

        await expect(invoicesApi.approve('invoice-1', 'token-123')).rejects.toMatchObject({
            message: 'Failed to approve invoice',
            status: 400,
        });
    });

    it('should update one invoice with payload and authorization header', async () => {
        const payload = {
            approvalStatus: 'REJECTED',
        };

        const mockResponse = {
            id: 'invoice-1',
            approvalStatus: 'REJECTED',
        };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await invoicesApi.update('invoice-1', payload, 'token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/invoices/invoice-1`, {
            method: 'PATCH',
            headers: {
                Authorization: 'Bearer token-123',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        expect(result).toEqual(mockResponse);
    });

    it('should throw a typed error when updating one invoice fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Failed to update invoice' }),
        } as unknown as Response);

        await expect(
            invoicesApi.update('invoice-1', { approvalStatus: 'REJECTED' }, 'token-123'),
        ).rejects.toMatchObject({
            message: 'Failed to update invoice',
            status: 400,
        });
    });

    it('should pay one invoice with amount and authorization header', async () => {
        const mockResponse = { success: true };

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

        const result = await invoicesApi.pay('invoice-1', 2500, 'token-123');

        expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/invoices/invoice-1/pay`, {
            method: 'PATCH',
            headers: {
                Authorization: 'Bearer token-123',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: 2500 }),
        });
        expect(result).toEqual(mockResponse);
    });

    it('should throw a typed error when paying one invoice fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 400,
            json: vi.fn().mockResolvedValue({ message: 'Failed to pay invoice' }),
        } as unknown as Response);

        await expect(invoicesApi.pay('invoice-1', 2500, 'token-123')).rejects.toMatchObject({
            message: 'Failed to pay invoice',
            status: 400,
        });
    });
});