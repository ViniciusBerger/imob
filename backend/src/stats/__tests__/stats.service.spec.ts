import { StatsService } from '../stats.service';

describe('StatsService', () => {
    let service: StatsService;

    const statsRepo = {
        countTotalProperties: jest.fn(),
        countAvailableProperties: jest.fn(),
        countRentedProperties: jest.fn(),
        findActiveLeaseRentValues: jest.fn(),
        findPropertyExpenses: jest.fn(),
        findFinancedProperties: jest.fn(),
        findMaintenanceCosts: jest.fn(),
        findExpiringContracts: jest.fn(),
        findPropertyPatrimonyInputs: jest.fn(),
        aggregatePaidInvoiceAmount: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(new Date(2026, 3, 1)); // Apr 1, 2026
        service = new StatsService(statsRepo as any);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('getDashboardStats', () => {
        it('builds dashboard stats from repository data', async () => {
            statsRepo.countTotalProperties.mockResolvedValue(10);
            statsRepo.countAvailableProperties.mockResolvedValue(4);
            statsRepo.countRentedProperties.mockResolvedValue(6);

            statsRepo.findActiveLeaseRentValues.mockResolvedValue([
                { rentValue: 1000 },
                { rentValue: 1500 },
            ]);

            statsRepo.findPropertyExpenses.mockResolvedValue([
                { value: 120, frequency: 'YEARLY' },
                { value: 200, frequency: 'MONTHLY' },
                { value: 500, frequency: 'ONCE' },
            ]);

            statsRepo.findFinancedProperties.mockResolvedValue([
                { installmentValue: 300 },
                { installmentValue: null },
            ]);

            statsRepo.findMaintenanceCosts.mockResolvedValue([
                { cost: 100 },
                { cost: 50 },
            ]);

            statsRepo.findExpiringContracts.mockResolvedValue([
                {
                    id: 'lease-1',
                    endDate: new Date(2026, 3, 20),
                    property: {
                        code: 'P-01',
                        address: 'Rua A, 123',
                        nickname: 'Centro',
                    },
                },
                {
                    id: 'lease-2',
                    endDate: new Date(2026, 3, 25),
                    property: {
                        code: 'P-02',
                        address: 'Rua B, 456',
                        nickname: null,
                    },
                },
            ]);

            statsRepo.findPropertyPatrimonyInputs.mockResolvedValue([
                {
                    purchasePrice: 100000,
                    isFinanced: false,
                    financingTotalValue: null,
                    installmentsCount: null,
                    installmentsPaid: null,
                    installmentValue: null,
                },
                {
                    purchasePrice: 200000,
                    isFinanced: true,
                    financingTotalValue: 50000,
                    installmentsCount: 10,
                    installmentsPaid: 4,
                    installmentValue: 1000,
                },
            ]);

            statsRepo.aggregatePaidInvoiceAmount.mockResolvedValue({
                _sum: { amount: 1800 },
            });

            const result = await service.getDashboardStats();

            expect(statsRepo.countTotalProperties).toHaveBeenCalled();
            expect(statsRepo.countAvailableProperties).toHaveBeenCalled();
            expect(statsRepo.countRentedProperties).toHaveBeenCalled();
            expect(statsRepo.findActiveLeaseRentValues).toHaveBeenCalledWith(new Date(2026, 3, 1));
            expect(statsRepo.findPropertyExpenses).toHaveBeenCalled();
            expect(statsRepo.findFinancedProperties).toHaveBeenCalled();
            expect(statsRepo.findMaintenanceCosts).toHaveBeenCalledWith(
                new Date(2026, 3, 1),
                new Date(2026, 4, 0),
            );
            expect(statsRepo.findPropertyPatrimonyInputs).toHaveBeenCalled();
            expect(statsRepo.aggregatePaidInvoiceAmount).toHaveBeenCalledWith(
                new Date(2026, 3, 1),
                new Date(2026, 4, 0),
            );

            expect(result).toEqual({
                totalProperties: 10,
                availableProperties: 4,
                rentedProperties: 6,
                occupancyRate: 60,

                financials: {
                    totalRevenue: 2500,
                    totalFixedCosts: 660,
                    netIncome: 1840,

                    patrimony: {
                        assets: 300000,
                        liabilities: 6000,
                        netWorth: 294000,
                    },

                    cashFlow: {
                        projectedIncome: 2500,
                        realizedIncome: 1800,
                        projectedExpenses: 660,
                        realizedExpenses: 660,
                    },
                },

                alerts: {
                    expiringContracts: [
                        {
                            id: 'lease-1',
                            propertyCode: 'P-01',
                            propertyTitle: 'Centro',
                            endDate: new Date(2026, 3, 20),
                        },
                        {
                            id: 'lease-2',
                            propertyCode: 'P-02',
                            propertyTitle: 'Rua B, 456',
                            endDate: new Date(2026, 3, 25),
                        },
                    ],
                },
            });
        });
    });
});