import { Injectable } from '@nestjs/common';
import { StatsPrismaRepository } from './repository/stats-prisma.repository';

@Injectable()
export class StatsService {
    constructor(private statsRepo: StatsPrismaRepository) { }

    async getDashboardStats() {
        const now = new Date();
        const activeLeaseFilter = {
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
            property: { deletedAt: null } // Ensure property is active
        };

        const totalProperties = await this.statsRepo.countTotalProperties();
        const availableProperties = await this.statsRepo.countAvailableProperties(activeLeaseFilter);
        const rentedProperties = await this.statsRepo.countRentedProperties(activeLeaseFilter);

        // Revenue (Sum of active leases rent)
        const activeLeases = await this.statsRepo.findActiveLeaseRentValues(now);
        const totalRevenue = activeLeases.reduce((sum, lease) => sum + Number(lease.rentValue), 0);

        // Fixed Costs (Property Expenses + Financed Installments)
        const expenses = await this.statsRepo.findPropertyExpenses();

        let totalFixedCosts = expenses.reduce((sum, exp) => {
            let val = Number(exp.value);
            if (exp.frequency === 'YEARLY') val = val / 12;
            if (exp.frequency === 'ONCE') val = 0;
            return sum + val;
        }, 0);

        // Add Financing Costs (Monthly Installments for properties marked as financed)
        const financedProperties = await this.statsRepo.findFinancedProperties();
        const financingCosts = financedProperties.reduce((sum, p) => sum + Number(p.installmentValue || 0), 0);

        // Maintenance Costs (Current Month)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const maintenanceItems = await this.statsRepo.findMaintenanceCosts(startOfMonth, endOfMonth);
        const maintenanceCosts = maintenanceItems.reduce((sum, m) => sum + Number(m.cost || 0), 0);

        totalFixedCosts += financingCosts + maintenanceCosts;

        // Alerts: Contracts expiring in next 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringContracts = await this.statsRepo.findExpiringContracts(now, thirtyDaysFromNow);

        // Patrimony (Net Worth)
        const allProperties = await this.statsRepo.findPropertyPatrimonyInputs();

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
        const paidInvoices = await this.statsRepo.aggregatePaidInvoiceAmount(startOfMonth, endOfMonth);
        const realizedIncome = Number(paidInvoices._sum.amount || 0);

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