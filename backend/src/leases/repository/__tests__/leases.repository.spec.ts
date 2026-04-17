import { LeasesRepository } from '../leases-prisma.repository';
import { PrismaService } from '../../../prisma.service';
import { leaseWithRelationsInclude } from '../leases-prisma.interface';

describe('LeasesRepository', () => {
  let repository: LeasesRepository;
  let prisma: {
    leaseContract: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    invoice: {
      createMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      leaseContract: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      invoice: {
        createMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    repository = new LeasesRepository(prisma as unknown as PrismaService);
  });

  describe('findAll', () => {
    it('should query all leases with expected filters and relations', async () => {
      const leases = [{ id: 'lease-1' }];
      prisma.leaseContract.findMany.mockResolvedValue(leases);

      const result = await repository.findAll();

      expect(prisma.leaseContract.findMany).toHaveBeenCalledWith({
        where: {
          property: {
            deletedAt: null,
          },
        },
        include: leaseWithRelationsInclude,
      });

      expect(result).toEqual(leases);
    });
  });

  describe('findById', () => {
    it('should query one lease by id with expected relations', async () => {
      const lease = { id: 'lease-1' };
      prisma.leaseContract.findUnique.mockResolvedValue(lease);

      const result = await repository.findById('lease-1');

      expect(prisma.leaseContract.findUnique).toHaveBeenCalledWith({
        where: { id: 'lease-1' },
        include: leaseWithRelationsInclude,
      });

      expect(result).toEqual(lease);
    });
  });

  describe('createWithInitialInvoices', () => {
    it('should create lease and invoices inside a transaction', async () => {
      const createdLease = { id: 'lease-123' };

      const tx = {
        leaseContract: {
          create: jest.fn().mockResolvedValue(createdLease),
        },
        invoice: {
          createMany: jest.fn().mockResolvedValue({ count: 2 }),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(tx));

      const leaseData = {
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        rentValue: 1500,
        propertyId: 'property-1',
        tenantId: 'tenant-1',
      };

      const invoiceDrafts = [
        {
          type: 'RENT' as const,
          description: 'January rent',
          amount: 1500,
          dueDate: new Date('2026-01-05'),
          status: 'PENDING' as const,
          propertyId: 'property-1',
        },
        {
          type: 'RENT' as const,
          description: 'February rent',
          amount: 1500,
          dueDate: new Date('2026-02-05'),
          status: 'PENDING' as const,
          propertyId: 'property-1',
        },
      ];

      const result = await repository.createWithInitialInvoices(leaseData, invoiceDrafts);

      expect(prisma.$transaction).toHaveBeenCalled();

      expect(tx.leaseContract.create).toHaveBeenCalledWith({
        data: leaseData,
      });

      expect(tx.invoice.createMany).toHaveBeenCalledWith({
        data: [
          {
            type: 'RENT',
            description: 'January rent',
            amount: 1500,
            dueDate: new Date('2026-01-05'),
            status: 'PENDING',
            leaseId: 'lease-123',
            propertyId: 'property-1',
          },
          {
            type: 'RENT',
            description: 'February rent',
            amount: 1500,
            dueDate: new Date('2026-02-05'),
            status: 'PENDING',
            leaseId: 'lease-123',
            propertyId: 'property-1',
          },
        ],
      });

      expect(result).toEqual(createdLease);
    });

    it('should not create invoices when invoice drafts are empty', async () => {
      const createdLease = { id: 'lease-123' };

      const tx = {
        leaseContract: {
          create: jest.fn().mockResolvedValue(createdLease),
        },
        invoice: {
          createMany: jest.fn(),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(tx));

      const leaseData = {
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        rentValue: 1500,
        propertyId: 'property-1',
        tenantId: 'tenant-1',
      };

      const result = await repository.createWithInitialInvoices(leaseData, []);

      expect(tx.leaseContract.create).toHaveBeenCalledWith({
        data: leaseData,
      });

      expect(tx.invoice.createMany).not.toHaveBeenCalled();
      expect(result).toEqual(createdLease);
    });
  });
});