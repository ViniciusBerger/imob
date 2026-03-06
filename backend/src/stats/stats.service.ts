import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        const now = new Date();
        const activeLeaseFilter = {
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
            property: { deletedAt: null } // Ensure property is active
        };
        const totalProperties = await this.prisma.property.count({ where: { deletedAt: null } });
        const availableProperties = await this.prisma.property.count({
            where: {
                deletedAt: null,
                leases: { none: activeLeaseFilter }
            }
        });
        const rentedProperties = await this.prisma.property.count({
            where: {
                deletedAt: null,
                leases: { some: activeLeaseFilter }
            }
        });

        // Revenue (Sum of active leases rent)
        const activeLeases = await this.prisma.leaseContract.findMany({
            where: {
                isActive: true,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
                property: { deletedAt: null }
            },
            select: { rentValue: true }
        });
        const totalRevenue = activeLeases.reduce((sum, lease) => sum + Number(lease.rentValue), 0);

        // Fixed Costs (Property Expenses + Financed Installments)
        // Must filter by non-deleted properties
        const expenses = await this.prisma.propertyExpense.findMany({
            where: { property: { deletedAt: null } }
        });

        let totalFixedCosts = expenses.reduce((sum, exp) => {
            let val = Number(exp.value);
            if (exp.frequency === 'YEARLY') val = val / 12;
            if (exp.frequency === 'ONCE') val = 0;
            return sum + val;
        }, 0);

        // Add Financing Costs (Monthly Installments for properties marked as financed)
        const financedProperties = await this.prisma.property.findMany({
            where: { isFinanced: true, deletedAt: null }
        });
        const financingCosts = financedProperties.reduce((sum, p) => sum + Number(p.installmentValue), 0);

        // Maintenance Costs (Current Month)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const maintenanceItems = await this.prisma.maintenance.findMany({
            where: {
                scheduledDate: { gte: startOfMonth, lte: endOfMonth },
                cost: { not: null },
                property: { deletedAt: null }
            },
            select: { cost: true }
        });
        const maintenanceCosts = maintenanceItems.reduce((sum, m) => sum + Number(m.cost), 0);

        totalFixedCosts += financingCosts + maintenanceCosts;

        // Alerts: Contracts expiring in next 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringContracts = await this.prisma.leaseContract.findMany({
            where: {
                isActive: true,
                endDate: {
                    lte: thirtyDaysFromNow,
                    gte: new Date()
                },
                property: { deletedAt: null }
            },
            include: { property: { select: { code: true, address: true, nickname: true } } }
        });

        // Patrimony (Net Worth)
        const allProperties = await this.prisma.property.findMany({
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

        let totalAssets = 0;
        let totalLiabilities = 0;

        for (const p of allProperties) {
            // Asset Value = Purchase Price (Book Value)
            totalAssets += Number(p.purchasePrice || 0);

            // Liability = Remaining Installments
            if (p.isFinanced) {
                const remaining = (p.installmentsCount || 0) - (p.installmentsPaid || 0);
                if (remaining > 0) {
                    totalLiabilities += remaining * Number(p.installmentValue || 0);
                }
            }
        }

        // Cash Flow: Projected vs Realized (Current Month)
        // Projected Income = Sum of Active Leases Rent
        // Realized Income = Sum of PAID Invoices in Current Month

        // Projected Expenses = Fixed Costs + Financing + Maintenance (Scheduled)
        // Realized Expenses = Maintenance (Completed/Paid) ?? - For now, we only track maintenance cost. 
        // We don't have a general "Expense Payment" ledger yet for fixed costs. 
        // We will assume Projected Expenses ~ Realized for fixed costs unless we have data.


        const paidInvoices = await this.prisma.invoice.aggregate({
            where: {
                status: 'PAID',
                paidAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                lease: { property: { deletedAt: null } }
            },
            _sum: { amount: true }
        });

        const realizedIncome = Number(paidInvoices._sum.amount || 0);
        // Projected Income is 'totalRevenue' calculated earlier (Sum of active rents)

        // Maintenance Costs (already calculated as maintenanceCosts) - assumes cost is "incurred"
        // Financing Costs (financingCosts)
        // Fixed Costs (totalFixedCosts)

        return {
            totalProperties,
            availableProperties,
            rentedProperties,
            occupancyRate: totalProperties > 0 ? (rentedProperties / totalProperties) * 100 : 0,

            // Financials
            financials: {
                totalRevenue, // Projected Monthly Revenue
                totalFixedCosts,
                netIncome: totalRevenue - totalFixedCosts,

                patrimony: {
                    assets: totalAssets,
                    liabilities: totalLiabilities,
                    netWorth: totalAssets - totalLiabilities
                },

                cashFlow: {
                    projectedIncome: totalRevenue,
                    realizedIncome: realizedIncome,
                    projectedExpenses: totalFixedCosts, // Approximation
                    realizedExpenses: totalFixedCosts // Approximation (until we have expense ledger)
                }
            },

            alerts: {
                expiringContracts: expiringContracts.map(c => ({
                    id: c.id,
                    propertyCode: c.property.code,
                    propertyTitle: c.property.nickname || c.property.address,
                    endDate: c.endDate
                }))
            }
        };
    }
}
