import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { EconomicIndicesRepository } from '../../repository/economic-indices-prisma.repository';

describe('EconomicIndicesRepository', () => {
    let repository: EconomicIndicesRepository;

    const prisma = {
        economicIndex: {
            upsert: jest.fn(),
            findMany: jest.fn(),
        },
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new EconomicIndicesRepository(prisma);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('upsertRate', () => {
        it('should upsert one economic index rate and map decimal to number', async () => {
            const index = {
                id: 'index-1',
                name: 'IPCA',
                date: new Date('2026-01-01T00:00:00.000Z'),
                value: new Prisma.Decimal(0.5),
            };

            (prisma.economicIndex.upsert as jest.Mock).mockResolvedValue(index);

            const result = await repository.upsertRate({
                name: 'IPCA',
                date: new Date('2026-01-01T00:00:00.000Z'),
                value: 0.5,
            });

            expect(prisma.economicIndex.upsert).toHaveBeenCalledWith({
                where: {
                    name_date: {
                        name: 'IPCA',
                        date: new Date('2026-01-01T00:00:00.000Z'),
                    },
                },
                update: {
                    value: 0.5,
                },
                create: {
                    name: 'IPCA',
                    date: new Date('2026-01-01T00:00:00.000Z'),
                    value: 0.5,
                },
            });

            expect(result).toEqual({
                id: 'index-1',
                name: 'IPCA',
                date: new Date('2026-01-01T00:00:00.000Z'),
                value: 0.5,
            });
        });
    });

    describe('findRecent', () => {
        it('should find recent indices without name filter', async () => {
            const indices = [
                {
                    id: 'index-1',
                    name: 'IPCA',
                    date: new Date('2026-01-01T00:00:00.000Z'),
                    value: new Prisma.Decimal(0.5),
                },
            ];

            (prisma.economicIndex.findMany as jest.Mock).mockResolvedValue(indices);

            const result = await repository.findRecent();

            expect(prisma.economicIndex.findMany).toHaveBeenCalledWith({
                where: {},
                orderBy: { date: 'desc' },
                take: 24,
            });

            expect(result).toEqual([
                {
                    id: 'index-1',
                    name: 'IPCA',
                    date: new Date('2026-01-01T00:00:00.000Z'),
                    value: 0.5,
                },
            ]);
        });

        it('should find recent indices filtered by name', async () => {
            const indices = [
                {
                    id: 'index-1',
                    name: 'IGPM',
                    date: new Date('2026-01-01T00:00:00.000Z'),
                    value: new Prisma.Decimal(0.75),
                },
            ];

            (prisma.economicIndex.findMany as jest.Mock).mockResolvedValue(indices);

            const result = await repository.findRecent('IGPM');

            expect(prisma.economicIndex.findMany).toHaveBeenCalledWith({
                where: { name: 'IGPM' },
                orderBy: { date: 'desc' },
                take: 24,
            });

            expect(result).toEqual([
                {
                    id: 'index-1',
                    name: 'IGPM',
                    date: new Date('2026-01-01T00:00:00.000Z'),
                    value: 0.75,
                },
            ]);
        });
    });

    describe('findRatesInRange', () => {
        it('should find economic index rates inside one period', async () => {
            const indices = [
                {
                    id: 'index-1',
                    name: 'IPCA',
                    date: new Date('2026-01-01T00:00:00.000Z'),
                    value: new Prisma.Decimal(0.5),
                },
                {
                    id: 'index-2',
                    name: 'IPCA',
                    date: new Date('2026-02-01T00:00:00.000Z'),
                    value: new Prisma.Decimal(0.7),
                },
            ];

            const startDate = new Date('2026-01-01T00:00:00.000Z');
            const endDate = new Date('2026-02-28T23:59:59.999Z');

            (prisma.economicIndex.findMany as jest.Mock).mockResolvedValue(indices);

            const result = await repository.findRatesInRange(
                'IPCA',
                startDate,
                endDate,
            );

            expect(prisma.economicIndex.findMany).toHaveBeenCalledWith({
                where: {
                    name: 'IPCA',
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: { date: 'asc' },
            });

            expect(result).toEqual([
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
                    value: 0.7,
                },
            ]);
        });
    });
});