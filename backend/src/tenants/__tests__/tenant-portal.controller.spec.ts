import { TenantPortalController } from '../tenant-portal.controller';
import { TenantPortalService } from '../tenant-portal.service';

describe('TenantPortalController', () => {
    let controller: TenantPortalController;

    const portalService = {
        getDashboardData: jest.fn(),
    } as unknown as jest.Mocked<TenantPortalService>;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new TenantPortalController(portalService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getDashboard', () => {
        it('should return dashboard data for the authenticated tenant email', async () => {
            const dashboardData = {
                tenant: {
                    id: 'tenant-1',
                    name: 'John Tenant',
                    email: 'tenant@test.com',
                },
                activeLease: {
                    id: 'lease-1',
                    tenantId: 'tenant-1',
                    isActive: true,
                },
                openInvoices: [
                    {
                        id: 'invoice-1',
                        leaseId: 'lease-1',
                        status: 'PENDING',
                    },
                ],
            };

            portalService.getDashboardData.mockResolvedValue(dashboardData as any);

            const req = {
                user: {
                    email: 'tenant@test.com',
                },
            };

            const result = await controller.getDashboard(req);

            expect(result).toBe(dashboardData);
            expect(portalService.getDashboardData).toHaveBeenCalledWith(
                'tenant@test.com',
            );
        });
    });
});