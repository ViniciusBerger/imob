import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { InvoicesRepository } from '../invoices-prisma.repository';
import { invoiceWithRelationsInclude } from '../invoices-prisma.interface';

/**
 * Unit tests for the Prisma invoice repository.
 *
 * Goal:
 * - verify Prisma calls are shaped correctly
 * - verify filter translation logic is preserved
 * - avoid DB setup during active refactor
 */
describe('InvoicesPrismaRepository', () => {
  let repository: InvoicesRepository;
  let prisma: {
    invoice: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      invoice: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    repository = new InvoicesRepository(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create one invoice with mapped Decimal and Date values', async () => {
      const createdInvoice = { id: 'invoice-1' };
      prisma.invoice.create.mockResolvedValue(createdInvoice);

      const result = await repository.create({
        type: 'RENT',
        description: 'January rent',
        amount: 1500,
        dueDate: '2026-01-05',
        status: 'PENDING',
        leaseId: 'lease-1',
        propertyId: 'property-1',
      });

      expect(prisma.invoice.create).toHaveBeenCalledTimes(1);

      const call = prisma.invoice.create.mock.calls[0][0];

      expect(call.data.type).toBe('RENT');
      expect(call.data.description).toBe('January rent');
      expect(call.data.amount).toEqual(new Prisma.Decimal(1500));
      expect(call.data.dueDate).toEqual(new Date('2026-01-05'));
      expect(call.data.status).toBe('PENDING');
      expect(call.data.leaseId).toBe('lease-1');
      expect(call.data.propertyId).toBe('property-1');

      expect(result).toEqual(createdInvoice);
    });
  });

  describe('findAll', () => {
    it('should query invoices with the base filters and relation includes', async () => {
      const invoices = [{ id: 'invoice-1' }];
      prisma.invoice.findMany.mockResolvedValue(invoices);

      const result = await repository.findAll();

      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { property: { deletedAt: null } },
            { lease: { property: { deletedAt: null } } },
          ],
        },
        include: invoiceWithRelationsInclude,
        orderBy: { dueDate: 'asc' },
      });

      expect(result).toEqual(invoices);
    });

    it('should translate PAYABLE into INSTALLMENT and EXPENSE', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);

      await repository.findAll({ type: 'PAYABLE' });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { property: { deletedAt: null } },
            { lease: { property: { deletedAt: null } } },
          ],
          type: { in: ['INSTALLMENT', 'EXPENSE'] },
        },
        include: invoiceWithRelationsInclude,
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should translate RECEIVABLE into RENT', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);

      await repository.findAll({ type: 'RECEIVABLE' });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { property: { deletedAt: null } },
            { lease: { property: { deletedAt: null } } },
          ],
          type: 'RENT',
        },
        include: invoiceWithRelationsInclude,
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should apply direct filters when provided', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);

      await repository.findAll({
        leaseId: 'lease-1',
        propertyId: 'property-1',
        status: 'PENDING',
        type: 'EXPENSE',
      });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { property: { deletedAt: null } },
            { lease: { property: { deletedAt: null } } },
          ],
          leaseId: 'lease-1',
          propertyId: 'property-1',
          status: 'PENDING',
          type: 'EXPENSE',
        },
        include: invoiceWithRelationsInclude,
        orderBy: { dueDate: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should query one invoice by id with relations', async () => {
      const invoice = { id: 'invoice-1' };
      prisma.invoice.findUnique.mockResolvedValue(invoice);

      const result = await repository.findById('invoice-1');

      expect(prisma.invoice.findUnique).toHaveBeenCalledWith({
        where: { id: 'invoice-1' },
        include: invoiceWithRelationsInclude,
      });

      expect(result).toEqual(invoice);
    });
  });

  describe('updateById', () => {
    it('should update only the provided fields with mapped Decimal/Date values', async () => {
      const updatedInvoice = { id: 'invoice-1' };
      prisma.invoice.update.mockResolvedValue(updatedInvoice);

      const result = await repository.updateById('invoice-1', {
        amount: 2200,
        dueDate: '2026-03-05',
        status: 'OVERDUE',
        notes: 'Updated',
      });

      expect(prisma.invoice.update).toHaveBeenCalledTimes(1);

      const call = prisma.invoice.update.mock.calls[0][0];

      expect(call.where).toEqual({ id: 'invoice-1' });
      expect(call.data.amount).toEqual(new Prisma.Decimal(2200));
      expect(call.data.dueDate).toEqual(new Date('2026-03-05'));
      expect(call.data.status).toBe('OVERDUE');
      expect(call.data.notes).toBe('Updated');

      expect(result).toEqual(updatedInvoice);
    });
  });

  describe('markAsPaidById', () => {
    it('should mark an invoice as paid', async () => {
      const updatedInvoice = { id: 'invoice-1', status: 'PAID' };
      prisma.invoice.update.mockResolvedValue(updatedInvoice);

      const result = await repository.markAsPaidById('invoice-1', {
        paidAmount: 1500,
        notes: 'Paid in full',
      });

      expect(prisma.invoice.update).toHaveBeenCalledTimes(1);

      const call = prisma.invoice.update.mock.calls[0][0];

      expect(call.where).toEqual({ id: 'invoice-1' });
      expect(call.data.status).toBe('PAID');
      expect(call.data.paidAmount).toEqual(new Prisma.Decimal(1500));
      expect(call.data.notes).toBe('Paid in full');
      expect(call.data.paidAt).toBeInstanceOf(Date);

      expect(result).toEqual(updatedInvoice);
    });
  });

  describe('removeById', () => {
    it('should delete one invoice by id', async () => {
      const deletedInvoice = { id: 'invoice-1' };
      prisma.invoice.delete.mockResolvedValue(deletedInvoice);

      const result = await repository.removeById('invoice-1');

      expect(prisma.invoice.delete).toHaveBeenCalledWith({
        where: { id: 'invoice-1' },
      });

      expect(result).toEqual(deletedInvoice);
    });
  });
});