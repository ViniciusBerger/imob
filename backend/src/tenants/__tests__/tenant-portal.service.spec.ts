import { NotFoundException } from '@nestjs/common';
import { TenantPortalRepository } from '../repository/tenant-portal-prisma.repository';
import { TenantPortalService } from '../tenant-portal.service';

describe('TenantPortalService', () => {
    let service: TenantPortalService;

    const tenantPortalRepository = {
        findTenantByEmail: jest.fn(),
        findTenantForDashboardByUserEmail: jest.fn(),
        findActiveLeaseByTenantId: jest.fn(),
        findOpenInvoicesByLeaseId: jest.fn(),
    } as unknown as jest.Mocked<TenantPortalRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new TenantPortalService(tenantPortalRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getTenantByEmail', () => {
        it('should delegate tenant lookup by email to repository', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'John Tenant',
                email: 'tenant@test.com',
                user: {
                    id: 'user-1',
                },
            };

            tenantPortalRepository.findTenantByEmail.mockResolvedValue(tenant);

            const result = await service.getTenantByEmail('tenant@test.com');

            expect(result).toBe(tenant);
            expect(tenantPortalRepository.findTenantByEmail).toHaveBeenCalledWith(
                'tenant@test.com',
            );
        });
    });

    describe('getDashboardData', () => {
        it('should throw NotFoundException when tenant is not found', async () => {
            tenantPortalRepository.findTenantForDashboardByUserEmail.mockResolvedValue(
                null,
            );

            await expect(
                service.getDashboardData('missing@test.com'),
            ).rejects.toThrow(NotFoundException);

            expect(
                tenantPortalRepository.findTenantForDashboardByUserEmail,
            ).toHaveBeenCalledWith('missing@test.com');
            expect(
                tenantPortalRepository.findActiveLeaseByTenantId,
            ).not.toHaveBeenCalled();
            expect(
                tenantPortalRepository.findOpenInvoicesByLeaseId,
            ).not.toHaveBeenCalled();
        });

        it('should return tenant, active lease, and open invoices', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'John Tenant',
                email: 'tenant@test.com',
            };

            const activeLease = {
                id: 'lease-1',
                tenantId: 'tenant-1',
                isActive: true,
                property: {
                    id: 'property-1',
                },
            };

            const openInvoices = [
                {
                    id: 'invoice-1',
                    leaseId: 'lease-1',
                    status: 'PENDING',
                    dueDate: new Date('2026-01-01'),
                },
            ];

            tenantPortalRepository.findTenantForDashboardByUserEmail.mockResolvedValue(
                tenant,
            );
            tenantPortalRepository.findActiveLeaseByTenantId.mockResolvedValue(
                activeLease,
            );
            tenantPortalRepository.findOpenInvoicesByLeaseId.mockResolvedValue(
                openInvoices,
            );

            const result = await service.getDashboardData('tenant@test.com');

            expect(result).toEqual({
                tenant,
                activeLease,
                openInvoices,
            });

            expect(
                tenantPortalRepository.findTenantForDashboardByUserEmail,
            ).toHaveBeenCalledWith('tenant@test.com');
            expect(
                tenantPortalRepository.findActiveLeaseByTenantId,
            ).toHaveBeenCalledWith('tenant-1');
            expect(
                tenantPortalRepository.findOpenInvoicesByLeaseId,
            ).toHaveBeenCalledWith('lease-1');
        });

        it('should return empty invoices when tenant has no active lease', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'John Tenant',
                email: 'tenant@test.com',
            };

            tenantPortalRepository.findTenantForDashboardByUserEmail.mockResolvedValue(
                tenant,
            );
            tenantPortalRepository.findActiveLeaseByTenantId.mockResolvedValue(null);

            const result = await service.getDashboardData('tenant@test.com');

            expect(result).toEqual({
                tenant,
                activeLease: null,
                openInvoices: [],
            });

            expect(
                tenantPortalRepository.findOpenInvoicesByLeaseId,
            ).not.toHaveBeenCalled();
        });
    });
});