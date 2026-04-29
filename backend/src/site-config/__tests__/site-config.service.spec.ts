import { SiteConfigRepository } from '../repository/site-config-prisma.repository';
import { SiteConfigService } from '../site-config.service';

describe('SiteConfigService', () => {
    let service: SiteConfigService;

    const siteConfigRepository = {
        findFirst: jest.fn(),
        create: jest.fn(),
        updateById: jest.fn(),
    } as unknown as jest.Mocked<SiteConfigRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new SiteConfigService(siteConfigRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getConfig', () => {
        it('should return existing site config when it exists', async () => {
            const config = {
                id: 'config-1',
                appName: 'eSolu - Imóveis',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            };

            siteConfigRepository.findFirst.mockResolvedValue(config);

            const result = await service.getConfig();

            expect(result).toBe(config);
            expect(siteConfigRepository.findFirst).toHaveBeenCalled();
            expect(siteConfigRepository.create).not.toHaveBeenCalled();
        });

        it('should create default site config when none exists', async () => {
            const config = {
                id: 'config-1',
                appName: 'eSolu - Imóveis',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            };

            siteConfigRepository.findFirst.mockResolvedValue(null);
            siteConfigRepository.create.mockResolvedValue(config);

            const result = await service.getConfig();

            expect(result).toBe(config);
            expect(siteConfigRepository.findFirst).toHaveBeenCalled();
            expect(siteConfigRepository.create).toHaveBeenCalledWith({
                appName: 'eSolu - Imóveis',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            });
        });
    });

    describe('updateConfig', () => {
        it('should update the current site config', async () => {
            const existingConfig = {
                id: 'config-1',
                appName: 'eSolu - Imóveis',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            };

            const updatedConfig = {
                id: 'config-1',
                appName: 'New App',
                primaryColor: 'green',
                layoutType: 'MINIMAL',
                showPrices: false,
            };

            siteConfigRepository.findFirst.mockResolvedValue(existingConfig);
            siteConfigRepository.updateById.mockResolvedValue(updatedConfig);

            const result = await service.updateConfig({
                appName: 'New App',
                primaryColor: 'green',
                layoutType: 'MINIMAL',
                showPrices: false,
            });

            expect(result).toBe(updatedConfig);
            expect(siteConfigRepository.updateById).toHaveBeenCalledWith('config-1', {
                appName: 'New App',
                primaryColor: 'green',
                layoutType: 'MINIMAL',
                showPrices: false,
            });
        });

        it('should create default config first when updating without existing config', async () => {
            const createdConfig = {
                id: 'config-1',
                appName: 'eSolu - Imóveis',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            };

            const updatedConfig = {
                id: 'config-1',
                appName: 'New App',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            };

            siteConfigRepository.findFirst.mockResolvedValueOnce(null);
            siteConfigRepository.create.mockResolvedValue(createdConfig);
            siteConfigRepository.updateById.mockResolvedValue(updatedConfig);

            const result = await service.updateConfig({
                appName: 'New App',
            });

            expect(result).toBe(updatedConfig);
            expect(siteConfigRepository.create).toHaveBeenCalledWith({
                appName: 'eSolu - Imóveis',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            });
            expect(siteConfigRepository.updateById).toHaveBeenCalledWith('config-1', {
                appName: 'New App',
                primaryColor: undefined,
                layoutType: undefined,
                showPrices: undefined,
            });
        });
    });

    describe('getPublicConfig', () => {
        it('should return the same config as getConfig', async () => {
            const config = {
                id: 'config-1',
                appName: 'eSolu - Imóveis',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            };

            siteConfigRepository.findFirst.mockResolvedValue(config);

            const result = await service.getPublicConfig();

            expect(result).toBe(config);
            expect(siteConfigRepository.findFirst).toHaveBeenCalled();
        });
    });
});