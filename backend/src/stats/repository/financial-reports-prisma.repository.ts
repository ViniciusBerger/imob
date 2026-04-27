import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class FinancialReportsPrismaRepository {
    constructor(private prisma: PrismaService) { }

    // handles finding paid rent invoices for DRE gross revenue
    findPaidRevenueInvoices(startDate: Date, endDate: Date) {
        return this.prisma.invoice.findMany({
            where: {
                type: 'RENT',
                status: 'PAID',
                paidAt: { gte: startDate, lte: endDate }
            },
            select: {
                amount: true,
                paidAmount: true
            }
        });
    }

    // handles finding paid expense/installment invoices for DRE operating expenses
    findPaidExpenseInvoices(startDate: Date, endDate: Date) {
        return this.prisma.invoice.findMany({
            where: {
                type: { in: ['EXPENSE', 'INSTALLMENT'] },
                status: 'PAID',
                paidAt: { gte: startDate, lte: endDate }
            },
            select: {
                amount: true,
                paidAmount: true
            }
        });
    }

    // handles finding active leases for monthly inflow projection
    findActiveLeasesForProjection(currentMonth: Date, nextMonth: Date) {
        return this.prisma.leaseContract.findMany({
            where: {
                isActive: true,
                endDate: { gte: currentMonth }, // Contract valid in this month
                startDate: { lte: nextMonth }
            },
            select: { rentValue: true }
        });
    }

    // handles finding property expenses for monthly outflow projection
    findPropertyExpensesForProjection() {
        return this.prisma.propertyExpense.findMany({
            select: { value: true }
        });
    }

    // handles finding financed properties for monthly installment projection
    findFinancedPropertiesForProjection(currentMonth: Date) {
        return this.prisma.property.findMany({
            where: {
                isFinanced: true,
                installmentValue: { not: null },
                financingEndDate: { gte: currentMonth }
            },
            select: { installmentValue: true }
        });
    }
}