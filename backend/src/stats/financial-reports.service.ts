import { Injectable } from '@nestjs/common';
import { FinancialReportsPrismaRepository } from './repository/financial-reports-prisma.repository';

@Injectable()
export class FinancialReportsService {
    constructor(private financialReportsRepo: FinancialReportsPrismaRepository) { }

    async getDRE(startDate: Date, endDate: Date) {
        // 1. Gross Revenue (Receita Bruta) - Paid Invoices (Aluguel)
        const revenueInvoices = await this.financialReportsRepo.findPaidRevenueInvoices(startDate, endDate);
        const grossRevenue = revenueInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount || inv.amount), 0);

        // 2. Variable Expenses (Impostos, Taxas cobradas no boleto)
        // Simplification: Assuming 10% tax/admin fee for demo purposes if not strictly defined
        const taxes = grossRevenue * 0.10;

        // 3. Net Revenue
        const netRevenue = grossRevenue - taxes;

        // 4. Operating Expenses (Despesas Operacionais: Manutenção, Custos Fixos pagos)
        const expenseInvoices = await this.financialReportsRepo.findPaidExpenseInvoices(startDate, endDate);
        const operatingExpenses = expenseInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount || inv.amount), 0);

        // 5. Net Income (Lucro Líquido)
        const netIncome = netRevenue - operatingExpenses;

        return {
            grossRevenue,
            taxes,
            netRevenue,
            operatingExpenses,
            netIncome,
            period: { start: startDate, end: endDate }
        };
    }

    async getCashFlowProjection(months: number = 6) {
        const today = new Date();
        const projection = [];

        for (let i = 0; i < months; i++) {
            const currentMonth = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);

            // Projected Inflow (Active Leases)
            const activeLeases = await this.financialReportsRepo.findActiveLeasesForProjection(currentMonth, nextMonth);
            const inflow = activeLeases.reduce((sum, lease) => sum + Number(lease.rentValue), 0);

            // Projected Outflow (Fixed Expenses + Installments)
            // 1. Property Expenses
            const fixedExpenses = await this.financialReportsRepo.findPropertyExpensesForProjection();
            let outflow = fixedExpenses.reduce((sum, exp) => {
                // Simplified: Assuming monthly for projection
                return sum + Number(exp.value);
            }, 0);

            // 2. Installments
            const financedProps = await this.financialReportsRepo.findFinancedPropertiesForProjection(currentMonth);
            outflow += financedProps.reduce((sum, p) => sum + Number(p.installmentValue || 0), 0);

            projection.push({
                month: currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
                inflow,
                outflow,
                balance: inflow - outflow
            });
        }

        return projection;
    }
}