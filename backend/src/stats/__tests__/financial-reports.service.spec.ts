import { FinancialReportsService } from '../financial-reports.service';

describe('FinancialReportsService', () => {
    let service: FinancialReportsService;

    const financialReportsRepo = {
        findPaidRevenueInvoices: jest.fn(),
        findPaidExpenseInvoices: jest.fn(),
        findActiveLeasesForProjection: jest.fn(),
        findPropertyExpensesForProjection: jest.fn(),
        findFinancedPropertiesForProjection: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(new Date(2026, 0, 15)); // Jan 15, 2026
        service = new FinancialReportsService(financialReportsRepo as any);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('getDRE', () => {
        it('calculates DRE values from repository data', async () => {
            const startDate = new Date(2026, 0, 1);
            const endDate = new Date(2026, 0, 31);

            financialReportsRepo.findPaidRevenueInvoices.mockResolvedValue([
                { amount: 1000, paidAmount: null },
                { amount: 900, paidAmount: 800 },
            ]);

            financialReportsRepo.findPaidExpenseInvoices.mockResolvedValue([
                { amount: 500, paidAmount: null },
                { amount: 250, paidAmount: 200 },
            ]);

            const result = await service.getDRE(startDate, endDate);

            expect(financialReportsRepo.findPaidRevenueInvoices).toHaveBeenCalledWith(startDate, endDate);
            expect(financialReportsRepo.findPaidExpenseInvoices).toHaveBeenCalledWith(startDate, endDate);

            expect(result).toEqual({
                grossRevenue: 1800,
                taxes: 180,
                netRevenue: 1620,
                operatingExpenses: 700,
                netIncome: 920,
                period: {
                    start: startDate,
                    end: endDate,
                },
            });
        });
    });

    describe('getCashFlowProjection', () => {
        it('builds monthly cash flow projection', async () => {
            financialReportsRepo.findActiveLeasesForProjection
                .mockResolvedValueOnce([{ rentValue: 1000 }, { rentValue: 500 }])
                .mockResolvedValueOnce([{ rentValue: 800 }]);

            financialReportsRepo.findPropertyExpensesForProjection.mockResolvedValue([
                { value: 200 },
                { value: 100 },
            ]);

            financialReportsRepo.findFinancedPropertiesForProjection
                .mockResolvedValueOnce([{ installmentValue: 300 }])
                .mockResolvedValueOnce([{ installmentValue: 100 }]);

            const result = await service.getCashFlowProjection(2);

            expect(financialReportsRepo.findActiveLeasesForProjection).toHaveBeenCalledTimes(2);
            expect(financialReportsRepo.findPropertyExpensesForProjection).toHaveBeenCalledTimes(2);
            expect(financialReportsRepo.findFinancedPropertiesForProjection).toHaveBeenCalledTimes(2);

            expect(result).toEqual([
                {
                    month: new Date(2026, 0, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
                    inflow: 1500,
                    outflow: 600,
                    balance: 900,
                },
                {
                    month: new Date(2026, 1, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
                    inflow: 800,
                    outflow: 400,
                    balance: 400,
                },
            ]);
        });
    });
});