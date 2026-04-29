import { SiteConfigController } from '../site-config.controller';
import { SiteConfigService } from '../site-config.service';

describe('SiteConfigController', () => {
    let controller: SiteConfigController;

    const siteConfigService = {
        getPublicConfig: jest.fn(),
        getConfig: jest.fn(),
        updateConfig: jest.fn(),
    } as unknown as jest.Mocked<SiteConfigService>;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new SiteConfigController(siteConfigService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getPublicConfig', () => {
        it('should return the public site config', async () => {
            const config = {
                id: 'config-1',
                appName: 'eSolu - Imóveis',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            };

            siteConfigService.getPublicConfig.mockResolvedValue(config);

            const result = await controller.getPublicConfig();

            expect(result).toBe(config);
            expect(siteConfigService.getPublicConfig).toHaveBeenCalled();
        });
    });

    describe('getAdminConfig', () => {
        it('should return the admin site config', async () => {
            const config = {
                id: 'config-1',
                appName: 'eSolu - Imóveis',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            };

            siteConfigService.getConfig.mockResolvedValue(config);

            const result = await controller.getAdminConfig();

            expect(result).toBe(config);
            expect(siteConfigService.getConfig).toHaveBeenCalled();
        });
    });

    describe('updateConfig', () => {
        it('should update the site config', async () => {
            const updateDto = {
                appName: 'New App',
                primaryColor: 'green',
                layoutType: 'MINIMAL',
                showPrices: false,
            };

            const updatedConfig = {
                id: 'config-1',
                ...updateDto,
            };

            siteConfigService.updateConfig.mockResolvedValue(updatedConfig);

            const result = await controller.updateConfig(updateDto);

            expect(result).toBe(updatedConfig);
            expect(siteConfigService.updateConfig).toHaveBeenCalledWith(updateDto);
        });

        it('should allow partial updates', async () => {
            const updateDto = {
                appName: 'New App',
            };

            const updatedConfig = {
                id: 'config-1',
                appName: 'New App',
                primaryColor: 'blue',
                layoutType: 'MODERN_GRID',
                showPrices: true,
            };

            siteConfigService.updateConfig.mockResolvedValue(updatedConfig);

            const result = await controller.updateConfig(updateDto);

            expect(result).toBe(updatedConfig);
            expect(siteConfigService.updateConfig).toHaveBeenCalledWith(updateDto);
        });
    });
});