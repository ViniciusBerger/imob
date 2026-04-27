import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { PropertiesRepository } from '../properties-prisma.repository';
import { PropertyType } from '../../dto/create-property.dto';

describe('PropertiesRepository', () => {
  let repository: PropertiesRepository;

  const prisma = {
    property: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    propertyDocument: {
      create: jest.fn(),
    },
    expense: {
      create: jest.fn(),
    },
    propertyExpense: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    propertyNote: {
      create: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new PropertiesRepository(prisma);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a property with mapped decimal and date fields', async () => {
      const result = { id: 'property-1' };
      (prisma.property.create as jest.Mock).mockResolvedValue(result);

      const response = await repository.create({
        code: 'PROP-001',
        address: '123 Main St',
        type: PropertyType.RESIDENTIAL,
        nickname: 'Main Unit',
        description: 'Test property',
        purchasePrice: '250000.50',
        installmentValue: 1200,
        financingTotalValue: '300000',
        financingEndDate: '2030-01-15',
        installmentsCount: 120,
        installmentsPaid: 10,
        isFinanced: true,
        photos: ['photo-1.jpg'],
      });

      expect(response).toBe(result);

      expect(prisma.property.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          code: 'PROP-001',
          address: '123 Main St',
          type: PropertyType.RESIDENTIAL,
          nickname: 'Main Unit',
          description: 'Test property',
          installmentsCount: 120,
          installmentsPaid: 10,
          isFinanced: true,
          photos: ['photo-1.jpg'],
          purchasePrice: expect.any(Prisma.Decimal),
          installmentValue: expect.any(Prisma.Decimal),
          financingTotalValue: expect.any(Prisma.Decimal),
          financingEndDate: expect.any(Date),
        }),
      });
    });

    it('should default photos to an empty array when photos are not provided', async () => {
      const result = { id: 'property-1' };
      (prisma.property.create as jest.Mock).mockResolvedValue(result);

      await repository.create({
        code: 'PROP-001',
        address: '123 Main St',
        type: PropertyType.RESIDENTIAL,
      });

      expect(prisma.property.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          photos: [],
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should find all properties', async () => {
      const result = [{ id: 'property-1' }];
      (prisma.property.findMany as jest.Mock).mockResolvedValue(result);

      const response = await repository.findAll();

      expect(response).toBe(result);
      expect(prisma.property.findMany).toHaveBeenCalledWith({});
    });
  });

  describe('findById', () => {
    it('should find a property by id with details', async () => {
      const result = { id: 'property-1' };
      (prisma.property.findUnique as jest.Mock).mockResolvedValue(result);

      const response = await repository.findById('property-1');

      expect(response).toBe(result);
      expect(prisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: 'property-1' },
        include: {
          leases: {
            include: {
              tenant: true,
              invoices: true,
            },
          },
          documents: true,
          maintenances: true,
          expenses: true,
          propertyExpenses: true,
          notes: true,
          invoices: true,
        },
      });
    });
  });

  describe('addPhotos', () => {
    it('should push new photos to a property', async () => {
      const result = { id: 'property-1' };
      (prisma.property.update as jest.Mock).mockResolvedValue(result);

      const response = await repository.addPhotos('property-1', [
        'photo-1.jpg',
        'photo-2.jpg',
      ]);

      expect(response).toBe(result);
      expect(prisma.property.update).toHaveBeenCalledWith({
        where: { id: 'property-1' },
        data: {
          photos: {
            push: ['photo-1.jpg', 'photo-2.jpg'],
          },
        },
      });
    });
  });

  describe('addDocument', () => {
    it('should create a property document', async () => {
      const result = { id: 'document-1' };
      (prisma.propertyDocument.create as jest.Mock).mockResolvedValue(result);

      const response = await repository.addDocument({
        title: 'Lease document',
        filePath: '/uploads/doc.pdf',
        fileType: 'application/pdf',
        propertyId: 'property-1',
      });

      expect(response).toBe(result);
      expect(prisma.propertyDocument.create).toHaveBeenCalledWith({
        data: {
          title: 'Lease document',
          filePath: '/uploads/doc.pdf',
          fileType: 'application/pdf',
          propertyId: 'property-1',
        },
      });
    });
  });

  describe('updateById', () => {
    it('should update only provided fields and map decimal/date fields', async () => {
      const result = { id: 'property-1' };
      (prisma.property.update as jest.Mock).mockResolvedValue(result);

      const response = await repository.updateById('property-1', {
        nickname: 'Updated name',
        purchasePrice: '275000',
        financingEndDate: '2031-05-20',
      });

      expect(response).toBe(result);
      expect(prisma.property.update).toHaveBeenCalledWith({
        where: { id: 'property-1' },
        data: expect.objectContaining({
          nickname: 'Updated name',
          purchasePrice: expect.any(Prisma.Decimal),
          financingEndDate: expect.any(Date),
        }),
      });
    });

    it('should allow nullable financial/date fields to be cleared', async () => {
      const result = { id: 'property-1' };
      (prisma.property.update as jest.Mock).mockResolvedValue(result);

      await repository.updateById('property-1', {
        purchasePrice: null,
        installmentValue: null,
        financingTotalValue: null,
        financingEndDate: null,
      });

      expect(prisma.property.update).toHaveBeenCalledWith({
        where: { id: 'property-1' },
        data: {
          purchasePrice: null,
          installmentValue: null,
          financingTotalValue: null,
          financingEndDate: null,
        },
      });
    });
  });

  describe('addExpense', () => {
    it('should create an expense linked to a property', async () => {
      const result = { id: 'expense-1' };
      (prisma.expense.create as jest.Mock).mockResolvedValue(result);

      const response = await repository.addExpense('property-1', {
        description: 'Repair',
        amount: '150.75',
        date: '2026-04-01',
        type: 'MAINTENANCE',
        status: 'PENDING',
      });

      expect(response).toBe(result);
      expect(prisma.expense.create).toHaveBeenCalledWith({
        data: {
          propertyId: 'property-1',
          description: 'Repair',
          amount: expect.any(Prisma.Decimal),
          date: expect.any(Date),
          type: 'MAINTENANCE',
          status: 'PENDING',
        },
      });
    });
  });

  describe('addPropertyExpense', () => {
    it('should create a fixed property expense', async () => {
      const result = { id: 'property-expense-1' };
      (prisma.propertyExpense.create as jest.Mock).mockResolvedValue(result);

      const response = await repository.addPropertyExpense('property-1', {
        name: 'Condo fee',
        value: '500',
        frequency: 'MONTHLY',
        dueDay: 5,
      });

      expect(response).toBe(result);
      expect(prisma.propertyExpense.create).toHaveBeenCalledWith({
        data: {
          propertyId: 'property-1',
          name: 'Condo fee',
          value: expect.any(Prisma.Decimal),
          frequency: 'MONTHLY',
          dueDay: 5,
        },
      });
    });
  });

  describe('removePropertyExpense', () => {
    it('should delete a fixed property expense by id', async () => {
      const result = { id: 'property-expense-1' };
      (prisma.propertyExpense.delete as jest.Mock).mockResolvedValue(result);

      const response = await repository.removePropertyExpense('property-expense-1');

      expect(response).toBe(result);
      expect(prisma.propertyExpense.delete).toHaveBeenCalledWith({
        where: { id: 'property-expense-1' },
      });
    });
  });

  describe('addNote', () => {
    it('should create a property note', async () => {
      const result = { id: 'note-1' };
      (prisma.propertyNote.create as jest.Mock).mockResolvedValue(result);

      const response = await repository.addNote({
        content: 'Important note',
        propertyId: 'property-1',
        userId: 'user-1',
      });

      expect(response).toBe(result);
      expect(prisma.propertyNote.create).toHaveBeenCalledWith({
        data: {
          content: 'Important note',
          propertyId: 'property-1',
          userId: 'user-1',
        },
      });
    });
  });

  describe('removeById', () => {
    it('should soft delete a property', async () => {
      const result = { id: 'property-1' };
      (prisma.property.update as jest.Mock).mockResolvedValue(result);

      const before = new Date();

      const response = await repository.removeById('property-1');

      const after = new Date();

      expect(response).toBe(result);
      expect(prisma.property.update).toHaveBeenCalledWith({
        where: { id: 'property-1' },
        data: {
          deletedAt: expect.any(Date),
        },
      });

      const deletedAt = (prisma.property.update as jest.Mock).mock.calls[0][0].data
        .deletedAt;

      expect(deletedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(deletedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});