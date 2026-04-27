import { StatsPrismaRepository } from '../stats-prisma.repository';
import { PrismaService } from '../../../prisma.service';

describe('StatsPrismaRepository', () => {
    let repository: StatsPrismaRepository;

    const prisma = {
        property: {
            count: jest.fn(),
            findMany: jest.fn(),
        },
        leaseContract: {
            findMany: jest.fn(),
        },
        propertyExpense: {
            findMany: jest.fn(),
        },
        maintenance: {
            findMany: jest.fn(),
        },
        invoice: {
            aggregate: jest.fn(),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new StatsPrismaRepository(prisma as unknown as PrismaService);
    });

    it('countTotalProperties delegates to prisma', async () => {
        prisma.property.count.mockResolvedValue(10);

        const result = await repository.countTotalProperties();

        expect(prisma.property.count).toHaveBeenCalledWith({
            where: { deletedAt: null },
        });
        expect(result).toBe(10);
    });

    it('countAvailableProperties delegates to prisma', async () => {
        const activeLeaseFilter = { isActive: true };
        prisma.property.count.mockResolvedValue(4);

        const result = await repository.countAvailableProperties(activeLeaseFilter as any);

        expect(prisma.property.count).toHaveBeenCalledWith({
            where: {
                deletedAt: null,
                leases: { none: activeLeaseFilter },
            },
        });
        expect(result).toBe(4);
    });

    it('countRentedProperties delegates to prisma', async () => {
        const activeLeaseFilter = { isActive: true };
        prisma.property.count.mockResolvedValue(6);

        const result = await repository.countRentedProperties(activeLeaseFilter as any);

        expect(prisma.property.count).toHaveBeenCalledWith({
            where: {
                deletedAt: null,
                leases: { some: activeLeaseFilter },
            },
        });
        expect(result).toBe(6);
    });

    it('findActiveLeaseRentValues delegates to prisma', async () => {
        const now = new Date(2026, 3, 1);
        const data = [{ rentValue: 1000 }];
        prisma.leaseContract.findMany.mockResolvedValue(data);

        const result = await repository.findActiveLeaseRentValues(now);

        expect(prisma.leaseContract.findMany).toHaveBeenCalledWith({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
                property: { deletedAt: null },
            },
            select: { rentValue: true },
        });
        expect(result).toEqual(data);
    });

    it('findPropertyExpenses delegates to prisma', async () => {
        const data = [{ value: 100, frequency: 'MONTHLY' }];
        prisma.propertyExpense.findMany.mockResolvedValue(data);

        const result = await repository.findPropertyExpenses();

        expect(prisma.propertyExpense.findMany).toHaveBeenCalledWith({
            where: { property: { deletedAt: null } },
            select: {
                value: true,
                frequency: true,
            },
        });
        expect(result).toEqual(data);
    });

    it('findFinancedProperties delegates to prisma', async () => {
        const data = [{ installmentValue: 300 }];
        prisma.property.findMany.mockResolvedValue(data);

        const result = await repository.findFinancedProperties();

        expect(prisma.property.findMany).toHaveBeenCalledWith({
            where: { isFinanced: true, deletedAt: null },
            select: { installmentValue: true },
        });
        expect(result).toEqual(data);
    });

    it('findMaintenanceCosts delegates to prisma', async () => {
        const startDate = new Date(2026, 3, 1);
        const endDate = new Date(2026, 4, 0);
        const data = [{ cost: 100 }];
        prisma.maintenance.findMany.mockResolvedValue(data);

        const result = await repository.findMaintenanceCosts(startDate, endDate);

        expect(prisma.maintenance.findMany).toHaveBeenCalledWith({
            where: {
                scheduledDate: { gte: startDate, lte: endDate },
                cost: { not: null },
                property: { deletedAt: null },
            },
            select: { cost: true },
        });
        expect(result).toEqual(data);
    });

    it('findExpiringContracts delegates to prisma', async () => {
        const now = new Date(2026, 3, 1);
        const thirtyDaysFromNow = new Date(2026, 4, 1);
        const data = [{ id: 'lease-1' }];
        prisma.leaseContract.findMany.mockResolvedValue(data);

        const result = await repository.findExpiringContracts(now, thirtyDaysFromNow);

        expect(prisma.leaseContract.findMany).toHaveBeenCalledWith({
            where: {
                isActive: true,
                endDate: {
                    lte: thirtyDaysFromNow,
                    gte: now,
                },
                property: { deletedAt: null },
            },
            include: {
                property: {
                    select: {
                        code: true,
                        address: true,
                        nickname: true,
                    },
                },
            },
        });
        expect(result).toEqual(data);
    });

    it('findPropertyPatrimonyInputs delegates to prisma', async () => {
        const data = [{ purchasePrice: 100000 }];
        prisma.property.findMany.mockResolvedValue(data);

        const result = await repository.findPropertyPatrimonyInputs();

        expect(prisma.property.findMany).toHaveBeenCalledWith({
            where: { deletedAt: null },
            select: {
                purchasePrice: true,
                isFinanced: true,
                financingTotalValue: true,
                installmentsCount: true,
                installmentsPaid: true,
                installmentValue: true,
            },
        });
        expect(result).toEqual(data);
    });

    it('aggregatePaidInvoiceAmount delegates to prisma', async () => {
        const startDate = new Date(2026, 3, 1);
        const endDate = new Date(2026, 4, 0);
        const data = { _sum: { amount: 1800 } };
        prisma.invoice.aggregate.mockResolvedValue(data);

        const result = await repository.aggregatePaidInvoiceAmount(startDate, endDate);

        expect(prisma.invoice.aggregate).toHaveBeenCalledWith({
            where: {
                status: 'PAID',
                paidAt: {
                    gte: startDate,
                    lte: endDate,
                },
                lease: { property: { deletedAt: null } },
            },
            _sum: { amount: true },
        });
        expect(result).toEqual(data);
    });
});