import { InvoicesController } from '../invoices.controller';

describe('InvoicesController', () => {
    let controller: InvoicesController;

    const invoicesService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        markAsPaid: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new InvoicesController(invoicesService as any);
    });

    describe('create', () => {
        it('maps dto to service input and delegates to service', async () => {
            const dto = {
                type: 'RENT',
                description: 'Aluguel 1/2026',
                amount: 1500,
                dueDate: new Date(2026, 0, 5),
                status: 'PENDING',
                leaseId: 'lease-1',
                propertyId: 'property-1',
            };

            const createdInvoice = { id: 'invoice-1' };
            invoicesService.create.mockResolvedValue(createdInvoice);

            const result = await controller.create(dto as any);

            expect(invoicesService.create).toHaveBeenCalledWith({
                type: 'RENT',
                description: 'Aluguel 1/2026',
                amount: 1500,
                dueDate: new Date(2026, 0, 5),
                status: 'PENDING',
                leaseId: 'lease-1',
                propertyId: 'property-1',
            });
            expect(result).toEqual(createdInvoice);
        });
    });

    describe('findAll', () => {
        it('maps query to filters and delegates to service', async () => {
            const query = {
                leaseId: 'lease-1',
                propertyId: 'property-1',
                status: 'PENDING',
                type: 'RECEIVABLE',
            };

            const invoices = [{ id: 'invoice-1' }];
            invoicesService.findAll.mockResolvedValue(invoices);

            const result = await controller.findAll(query);

            expect(invoicesService.findAll).toHaveBeenCalledWith({
                leaseId: 'lease-1',
                propertyId: 'property-1',
                status: 'PENDING',
                type: 'RECEIVABLE',
            });
            expect(result).toEqual(invoices);
        });
    });

    describe('findOne', () => {
        it('delegates invoice lookup by id', async () => {
            const invoice = { id: 'invoice-1' };
            invoicesService.findOne.mockResolvedValue(invoice);

            const result = await controller.findOne('invoice-1');

            expect(invoicesService.findOne).toHaveBeenCalledWith('invoice-1');
            expect(result).toEqual(invoice);
        });
    });

    describe('update', () => {
        it('maps update body and delegates to service', async () => {
            const body = {
                description: 'updated',
                amount: 2000,
                notes: 'new note',
                approvalStatus: 'PENDING',
            };

            const updatedInvoice = { id: 'invoice-1', ...body };
            invoicesService.update.mockResolvedValue(updatedInvoice);

            const result = await controller.update('invoice-1', body);

            expect(invoicesService.update).toHaveBeenCalledWith('invoice-1', {
                type: undefined,
                description: 'updated',
                amount: 2000,
                dueDate: undefined,
                status: undefined,
                approvalStatus: 'PENDING',
                paidAt: undefined,
                paidAmount: undefined,
                notes: 'new note',
                leaseId: undefined,
                propertyId: undefined,
            });
            expect(result).toEqual(updatedInvoice);
        });
    });

    describe('markAsPaid', () => {
        it('delegates payment payload to service', async () => {
            const paidInvoice = { id: 'invoice-1', status: 'PAID' };
            invoicesService.markAsPaid.mockResolvedValue(paidInvoice);

            const result = await controller.markAsPaid('invoice-1', {
                amount: 1500,
                notes: 'paid',
            });

            expect(invoicesService.markAsPaid).toHaveBeenCalledWith('invoice-1', 1500, 'paid');
            expect(result).toEqual(paidInvoice);
        });
    });

    describe('remove', () => {
        it('delegates invoice removal to service', async () => {
            const removedInvoice = { id: 'invoice-1' };
            invoicesService.remove.mockResolvedValue(removedInvoice);

            const result = await controller.remove('invoice-1');

            expect(invoicesService.remove).toHaveBeenCalledWith('invoice-1');
            expect(result).toEqual(removedInvoice);
        });
    });

    describe('approve', () => {
        it('delegates approval update to service', async () => {
            const approvedInvoice = { id: 'invoice-1', approvalStatus: 'APPROVED' };
            invoicesService.update.mockResolvedValue(approvedInvoice);

            const result = await controller.approve('invoice-1');

            expect(invoicesService.update).toHaveBeenCalledWith('invoice-1', {
                approvalStatus: 'APPROVED',
            });
            expect(result).toEqual(approvedInvoice);
        });
    });
});