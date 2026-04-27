import { StatsController } from '../stats.controller';

describe('StatsController', () => {
    let controller: StatsController;

    const statsService = {
        getDashboardStats: jest.fn(),
    };

    const reportsService = {
        getDRE: jest.fn(),
        getCashFlowProjection: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new StatsController(statsService as any, reportsService as any);
    });

    describe('getDashboardStats', () => {
        it('delegates dashboard stats to stats service', async () => {
            const dashboard = { totalProperties: 10 };
            statsService.getDashboardStats.mockResolvedValue(dashboard);

            const result = await controller.getDashboardStats();

            expect(statsService.getDashboardStats).toHaveBeenCalledWith();
            expect(result).toEqual(dashboard);
        });
    });

    describe('getDRE', () => {
        it('delegates dre with provided start and end dates', async () => {
            const dre = { netIncome: 1000 };
            reportsService.getDRE.mockResolvedValue(dre);

            const result = await controller.getDRE({
                startDate: '2026-01-01',
                endDate: '2026-03-31',
            });

            expect(reportsService.getDRE).toHaveBeenCalledWith(
                new Date('2026-01-01'),
                new Date('2026-03-31'),
            );
            expect(result).toEqual(dre);
        });

        it('uses current year start and now when dates are not provided', async () => {
            jest.useFakeTimers().setSystemTime(new Date('2026-04-18T12:00:00.000Z'));

            const dre = { netIncome: 2000 };
            reportsService.getDRE.mockResolvedValue(dre);

            const result = await controller.getDRE({});

            expect(reportsService.getDRE).toHaveBeenCalledWith(
                new Date(2026, 0, 1),
                new Date('2026-04-18T12:00:00.000Z'),
            );
            expect(result).toEqual(dre);

            jest.useRealTimers();
        });
    });

    describe('getCashFlowProjection', () => {
        it('delegates cash flow projection to reports service', async () => {
            const projection = [{ month: 'janeiro de 2026', balance: 1000 }];
            reportsService.getCashFlowProjection.mockResolvedValue(projection);

            const result = await controller.getCashFlowProjection();

            expect(reportsService.getCashFlowProjection).toHaveBeenCalledWith();
            expect(result).toEqual(projection);
        });
    });
});