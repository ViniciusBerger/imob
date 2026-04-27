import { Injectable } from '@nestjs/common';
import { Prisma, Property } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
    IActiveLeaseRentRecord,
    IExpiringContractRecord,
    IFinancedPropertyRecord,
    IMaintenanceCostRecord,
    IPropertyExpenseRecord,
    IPropertyPatrimonyRecord,
} from './stats-prisma.interface';

@Injectable()
export class StatsPrismaRepository {
    constructor(private prisma: PrismaService) { }

    // handles counting all active properties
    countTotalProperties() {
        return this.prisma.property.count({
            where: { deletedAt: null }
        });
    }

    // handles counting available properties based on active lease filter
    countAvailableProperties(activeLeaseFilter: Prisma.LeaseContractWhereInput) {
        return this.prisma.property.count({
            where: {
                deletedAt: null,
                leases: { none: activeLeaseFilter }
            }
        });
    }

    // handles counting rented properties based on active lease filter
    countRentedProperties(activeLeaseFilter: Prisma.LeaseContractWhereInput) {
        return this.prisma.property.count({
            where: {
                deletedAt: null,
                leases: { some: activeLeaseFilter }
            }
        });
    }

    // handles finding active leases rent values for projected revenue
    findActiveLeaseRentValues(now: Date): Promise<IActiveLeaseRentRecord[]> {
        return this.prisma.leaseContract.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
                property: { deletedAt: null }
            },
            select: { rentValue: true }
        });
    }

    // handles finding fixed property expenses for non-deleted properties
    findPropertyExpenses(): Promise<IPropertyExpenseRecord[]> {
        return this.prisma.propertyExpense.findMany({
            where: { property: { deletedAt: null } },
            select: {
                value: true,
                frequency: true
            }
        });
    }

    // handles finding financed properties for monthly financing costs
    findFinancedProperties(): Promise<IFinancedPropertyRecord[]> {
        return this.prisma.property.findMany({
            where: { isFinanced: true, deletedAt: null },
            select: { installmentValue: true }
        });
    }

    // handles finding maintenance costs for current month
    findMaintenanceCosts(startDate: Date, endDate: Date): Promise<IMaintenanceCostRecord[]> {
        return this.prisma.maintenance.findMany({
            where: {
                scheduledDate: { gte: startDate, lte: endDate },
                cost: { not: null },
                property: { deletedAt: null }
            },
            select: { cost: true }
        });
    }

    // handles finding contracts expiring in next 30 days
    findExpiringContracts(now: Date, thirtyDaysFromNow: Date): Promise<IExpiringContractRecord[]> {
        return this.prisma.leaseContract.findMany({
            where: {
                isActive: true,
                endDate: {
                    lte: thirtyDaysFromNow,
                    gte: now
                },
                property: { deletedAt: null }
            },
            include: {
                property: {
                    select: {
                        code: true,
                        address: true,
                        nickname: true
                    }
                }
            }
        });
    }

    // handles finding property data for patrimony calculation
    findPropertyPatrimonyInputs(): Promise<IPropertyPatrimonyRecord[]> {
        return this.prisma.property.findMany({
            where: { deletedAt: null },
            select: {
                purchasePrice: true,
                isFinanced: true,
                financingTotalValue: true,
                installmentsCount: true,
                installmentsPaid: true,
                installmentValue: true
            }
        });
    }

    // handles aggregating paid invoice amount for realized income
    aggregatePaidInvoiceAmount(startDate: Date, endDate: Date) {
        return this.prisma.invoice.aggregate({
            where: {
                status: 'PAID',
                paidAt: {
                    gte: startDate,
                    lte: endDate
                },
                lease: { property: { deletedAt: null } }
            },
            _sum: { amount: true }
        });
    }
}