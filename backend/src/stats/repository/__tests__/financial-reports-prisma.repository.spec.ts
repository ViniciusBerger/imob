import { FinancialReportsPrismaRepository } from '../financial-reports-prisma.repository';
import { PrismaService } from '../../../prisma.service';

describe('FinancialReportsPrismaRepository', () => {
    let repository: FinancialReportsPrismaRepository;

    const prisma = {
        invoice: {
            findMany: jest.fn(),
        },
        leaseContract: {
            findMany: jest.fn(),
        },
        propertyExpense: {
            findMany: jest.fn(),
        },
        property: {
            findMany: jest.fn(),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new FinancialReportsPrismaRepository(prisma as unknown as PrismaService);
    });

    it('findPaidRevenueInvoices delegates to prisma', async () => {
        const startDate = new Date(2026, 0, 1);
        const endDate = new Date(2026, 0, 31);
        const data = [{ amount: 1000, paidAmount: 1000 }];
        prisma.invoice.findMany.mockResolvedValue(data);

        const result = await repository.findPaidRevenueInvoices(startDate, endDate);

        expect(prisma.invoice.findMany).toHaveBeenCalledWith({
            where: {
                type: 'RENT',
                status: 'PAID',
                paidAt: { gte: startDate, lte: endDate },
            },
            select: {
                amount: true,
                paidAmount: true,
            },
        });
        expect(result).toEqual(data);
    });

    it('findPaidExpenseInvoices delegates to prisma', async () => {
        const startDate = new Date(2026, 0, 1);
        const endDate = new Date(2026, 0, 31);
        const data = [{ amount: 500, paidAmount: 500 }];
        prisma.invoice.findMany.mockResolvedValue(data);

        const result = await repository.findPaidExpenseInvoices(startDate, endDate);

        expect(prisma.invoice.findMany).toHaveBeenCalledWith({
            where: {
                type: { in: ['EXPENSE', 'INSTALLMENT'] },
                status: 'PAID',
                paidAt: { gte: startDate, lte: endDate },
            },
            select: {
                amount: true,
                paidAmount: true,
            },
        });
        expect(result).toEqual(data);
    });

    it('findActiveLeasesForProjection delegates to prisma', async () => {
        const currentMonth = new Date(2026, 0, 1);
        const nextMonth = new Date(2026, 0, 31);
        const data = [{ rentValue: 1000 }];
        prisma.leaseContract.findMany.mockResolvedValue(data);

        const result = await repository.findActiveLeasesForProjection(currentMonth, nextMonth);

        expect(prisma.leaseContract.findMany).toHaveBeenCalledWith({
            where: {
                isActive: true,
                endDate: { gte: currentMonth },
                startDate: { lte: nextMonth },
            },
            select: { rentValue: true },
        });
        expect(result).toEqual(data);
    });

    it('findPropertyExpensesForProjection delegates to prisma', async () => {
        const data = [{ value: 200 }];
        prisma.propertyExpense.findMany.mockResolvedValue(data);

        const result = await repository.findPropertyExpensesForProjection();

        expect(prisma.propertyExpense.findMany).toHaveBeenCalledWith({
            select: { value: true },
        });
        expect(result).toEqual(data);
    });

    it('findFinancedPropertiesForProjection delegates to prisma', async () => {
        const currentMonth = new Date(2026, 0, 1);
        const data = [{ installmentValue: 300 }];
        prisma.property.findMany.mockResolvedValue(data);

        const result = await repository.findFinancedPropertiesForProjection(currentMonth);

        expect(prisma.property.findMany).toHaveBeenCalledWith({
            where: {
                isFinanced: true,
                installmentValue: { not: null },
                financingEndDate: { gte: currentMonth },
            },
            select: { installmentValue: true },
        });
        expect(result).toEqual(data);
    });
});