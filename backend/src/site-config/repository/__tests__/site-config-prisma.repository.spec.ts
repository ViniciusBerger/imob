import { PrismaService } from '../../../prisma.service';
import { SiteConfigRepository } from '../site-config-prisma.repository';

describe('SiteConfigRepository', () => {
    let repository: SiteConfigRepository;

    const prisma = {
        siteConfig: {
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new SiteConfigRepository(prisma);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findFirst', () => {
        it('should find the first site config', async () => {
            const config = {
                id: 'config-1',
                appName: 'eSolu - Imóveis',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            };

            (prisma.siteConfig.findFirst as jest.Mock).mockResolvedValue(config);

            const result = await repository.findFirst();

            expect(result).toBe(config);
            expect(prisma.siteConfig.findFirst).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should create one site config', async () => {
            const config = {
                id: 'config-1',
                appName: 'eSolu - Imóveis',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            };

            (prisma.siteConfig.create as jest.Mock).mockResolvedValue(config);

            const result = await repository.create({
                appName: 'eSolu - Imóveis',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            });

            expect(result).toBe(config);
            expect(prisma.siteConfig.create).toHaveBeenCalledWith({
                data: {
                    appName: 'eSolu - Imóveis',
                    primaryColor: 'blue',
                    layoutType: 'MODERN_GRID',
                    showPrices: true,
                },
            });
        });
    });

    describe('updateById', () => {
        it('should update one site config by id', async () => {
            const config = {
                id: 'config-1',
                appName: 'Updated App',
                primaryColor: 'green',
                layoutType: 'MODERN_GRID',
                showPrices: false,
            };

            (prisma.siteConfig.update as jest.Mock).mockResolvedValue(config);

            const result = await repository.updateById('config-1', {
                appName: 'Updated App',
                primaryColor: 'green',
                showPrices: false,
            });

            expect(result).toBe(config);
            expect(prisma.siteConfig.update).toHaveBeenCalledWith({
                where: { id: 'config-1' },
                data: {
                    appName: 'Updated App',
                    primaryColor: 'green',
                    layoutType: undefined,
                    showPrices: false,
                },
            });
        });
    });
});