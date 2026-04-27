import { InvoicesService } from '../invoices.service';
import { CreateInvoiceRecordData, FindInvoicesFilters } from '../repository/invoices-prisma.interface';

describe('InvoicesService', () => {
    let service: InvoicesService;

    const invoiceRepo = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        updateById: jest.fn(),
        markAsPaidById: jest.fn(),
        removeById: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new InvoicesService(invoiceRepo as any);
    });

    describe('create', () => {
        it('delegates invoice creation to repository', async () => {
            const createdInvoice = { id: 'invoice-1' };
            const input: CreateInvoiceRecordData = {
                type: 'RENT',
                description: 'Aluguel 1/2026',
                amount: 1500,
                dueDate: new Date(2026, 0, 5),
                status: 'PENDING',
                propertyId: 'property-1',
                leaseId: 'lease-1',
            };

            invoiceRepo.create.mockResolvedValue(createdInvoice);

            const result = await service.create(input);

            expect(invoiceRepo.create).toHaveBeenCalledWith(input);
            expect(result).toEqual(createdInvoice);
        });
    });

    describe('findAll', () => {
        it('delegates invoice listing to repository with filters', async () => {
            const invoices = [{ id: 'invoice-1' }];
            const filters:FindInvoicesFilters = {
                propertyId: 'property-1',
                status: 'PENDING',
                type: 'RECEIVABLE',
            };

            invoiceRepo.findAll.mockResolvedValue(invoices);

            const result = await service.findAll(filters);

            expect(invoiceRepo.findAll).toHaveBeenCalledWith(filters);
            expect(result).toEqual(invoices);
        });

        it('delegates invoice listing without filters', async () => {
            const invoices = [{ id: 'invoice-1' }];
            invoiceRepo.findAll.mockResolvedValue(invoices);

            const result = await service.findAll();

            expect(invoiceRepo.findAll).toHaveBeenCalledWith(undefined);
            expect(result).toEqual(invoices);
        });
    });

    describe('findOne', () => {
        it('delegates invoice lookup by id to repository', async () => {
            const invoice = { id: 'invoice-1' };
            invoiceRepo.findById.mockResolvedValue(invoice);

            const result = await service.findOne('invoice-1');

            expect(invoiceRepo.findById).toHaveBeenCalledWith('invoice-1');
            expect(result).toEqual(invoice);
        });
    });

    describe('update', () => {
        it('delegates invoice update to repository', async () => {
            const updatedInvoice = { id: 'invoice-1', notes: 'updated' };
            const data = { notes: 'updated' };

            invoiceRepo.updateById.mockResolvedValue(updatedInvoice);

            const result = await service.update('invoice-1', data);

            expect(invoiceRepo.updateById).toHaveBeenCalledWith('invoice-1', data);
            expect(result).toEqual(updatedInvoice);
        });
    });

    describe('markAsPaid', () => {
        it('delegates mark as paid to repository with wrapped payload', async () => {
            const paidInvoice = { id: 'invoice-1', status: 'PAID' };
            invoiceRepo.markAsPaidById.mockResolvedValue(paidInvoice);

            const result = await service.markAsPaid('invoice-1', 1500, 'Paid in full');

            expect(invoiceRepo.markAsPaidById).toHaveBeenCalledWith('invoice-1', {
                paidAmount: 1500,
                notes: 'Paid in full',
            });
            expect(result).toEqual(paidInvoice);
        });

        it('delegates mark as paid without notes', async () => {
            const paidInvoice = { id: 'invoice-1', status: 'PAID' };
            invoiceRepo.markAsPaidById.mockResolvedValue(paidInvoice);

            const result = await service.markAsPaid('invoice-1', 1500);

            expect(invoiceRepo.markAsPaidById).toHaveBeenCalledWith('invoice-1', {
                paidAmount: 1500,
                notes: undefined,
            });
            expect(result).toEqual(paidInvoice);
        });
    });

    describe('remove', () => {
        it('delegates invoice removal to repository', async () => {
            const removedInvoice = { id: 'invoice-1' };
            invoiceRepo.removeById.mockResolvedValue(removedInvoice);

            const result = await service.remove('invoice-1');

            expect(invoiceRepo.removeById).toHaveBeenCalledWith('invoice-1');
            expect(result).toEqual(removedInvoice);
        });
    });
});