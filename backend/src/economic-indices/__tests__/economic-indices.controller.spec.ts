import { EconomicIndicesController } from '../economic-indices.controller';
import { EconomicIndicesService } from '../economic-indices.service';

describe('EconomicIndicesController', () => {
    let controller: EconomicIndicesController;

    const economicIndicesService = {
        getIndices: jest.fn(),
        addIndexRate: jest.fn(),
    } as unknown as jest.Mocked<EconomicIndicesService>;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new EconomicIndicesController(economicIndicesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
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

            economicIndicesService.getIndices.mockResolvedValue(indices);

            const result = await controller.getIndices();

            expect(result).toBe(indices);
            expect(economicIndicesService.getIndices).toHaveBeenCalledWith(undefined);
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

            economicIndicesService.getIndices.mockResolvedValue(indices);

            const result = await controller.getIndices('IGPM');

            expect(result).toBe(indices);
            expect(economicIndicesService.getIndices).toHaveBeenCalledWith('IGPM');
        });
    });

    describe('addIndex', () => {
        it('should add one economic index rate', async () => {
            const body = {
                name: 'IPCA',
                date: '2026-01-01T00:00:00.000Z',
                value: 0.5,
            };

            const index = {
                id: 'index-1',
                name: 'IPCA',
                date: new Date('2026-01-01T00:00:00.000Z'),
                value: 0.5,
            };

            economicIndicesService.addIndexRate.mockResolvedValue(index);

            const result = await controller.addIndex(body);

            expect(result).toBe(index);
            expect(economicIndicesService.addIndexRate).toHaveBeenCalledWith(
                'IPCA',
                new Date('2026-01-01T00:00:00.000Z'),
                0.5,
            );
        });
    });
});