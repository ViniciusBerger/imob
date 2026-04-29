import { EconomicIndicesRepository } from '../repository/economic-indices-prisma.repository';
import { EconomicIndicesService } from '../economic-indices.service';

describe('EconomicIndicesService', () => {
    let service: EconomicIndicesService;

    const economicIndicesRepository = {
        upsertRate: jest.fn(),
        findRecent: jest.fn(),
        findRatesInRange: jest.fn(),
    } as unknown as jest.Mocked<EconomicIndicesRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new EconomicIndicesService(economicIndicesRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addIndexRate', () => {
        it('should upsert one economic index rate', async () => {
            const index = {
                id: 'index-1',
                name: 'IPCA',
                date: new Date('2026-01-01T00:00:00.000Z'),
                value: 0.5,
            };

            economicIndicesRepository.upsertRate.mockResolvedValue(index);

            const result = await service.addIndexRate(
                'IPCA',
                new Date('2026-01-01T00:00:00.000Z'),
                0.5,
            );

            expect(result).toBe(index);
            expect(economicIndicesRepository.upsertRate).toHaveBeenCalledWith({
                name: 'IPCA',
                date: new Date('2026-01-01T00:00:00.000Z'),
                value: 0.5,
            });
        });
    });

    describe('getIndices', () => {
        it('should return recent indices without filter', async () => {
            const indices = [
                {
                    id: 'index-1',
                    name: 'IPCA',
                    date: new Date('2026-01-01T00:00:00.000Z'),
                    value: 0.5,
                },
            ];

            economicIndicesRepository.findRecent.mockResolvedValue(indices);

            const result = await service.getIndices();

            expect(result).toBe(indices);
            expect(economicIndicesRepository.findRecent).toHaveBeenCalledWith(undefined);
        });

        it('should return recent indices filtered by name', async () => {
            const indices = [
                {
                    id: 'index-1',
                    name: 'IGPM',
                    date: new Date('2026-01-01T00:00:00.000Z'),
                    value: 0.75,
                },
            ];

            economicIndicesRepository.findRecent.mockResolvedValue(indices);

            const result = await service.getIndices('IGPM');

            expect(result).toBe(indices);
            expect(economicIndicesRepository.findRecent).toHaveBeenCalledWith('IGPM');
        });
    });

    describe('getAccumulatedRate', () => {
        it('should calculate accumulated rate for one period', async () => {
            economicIndicesRepository.findRatesInRange.mockResolvedValue([
                {
                    id: 'index-1',
                    name: 'IPCA',
                    date: new Date('2026-01-01T00:00:00.000Z'),
                    value: 0.5,
                },
                {
                    id: 'index-2',
                    name: 'IPCA',
                    date: new Date('2026-02-01T00:00:00.000Z'),
                    value: 1,
                },
            ]);

            const result = await service.getAccumulatedRate(
                'IPCA',
                new Date('2026-01-01T00:00:00.000Z'),
                new Date('2026-02-28T23:59:59.999Z'),
            );

            expect(economicIndicesRepository.findRatesInRange).toHaveBeenCalledWith(
                'IPCA',
                new Date('2026-01-01T00:00:00.000Z'),
                new Date('2026-02-28T23:59:59.999Z'),
            );

            expect(result).toBeCloseTo(1.505, 3);
        });

        it('should return zero when there are no rates in the period', async () => {
            economicIndicesRepository.findRatesInRange.mockResolvedValue([]);

            const result = await service.getAccumulatedRate(
                'IPCA',
                new Date('2026-01-01T00:00:00.000Z'),
                new Date('2026-02-28T23:59:59.999Z'),
            );

            expect(result).toBe(0);
        });
    });
});