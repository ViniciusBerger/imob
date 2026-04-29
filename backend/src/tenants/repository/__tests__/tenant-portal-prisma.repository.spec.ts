import { PrismaService } from '../../../prisma.service';
import { TenantPortalRepository } from '../tenant-portal-prisma.repository';

describe('TenantPortalRepository', () => {
    let repository: TenantPortalRepository;

    const prisma = {
        tenant: {
            findFirst: jest.fn(),
        },
        leaseContract: {
            findFirst: jest.fn(),
        },
        invoice: {
            findMany: jest.fn(),
        },
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new TenantPortalRepository(prisma);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findTenantByEmail', () => {
        it('should find a tenant by email with user included', async () => {
            const tenant = {
                id: 'tenant-1',
                email: 'tenant@test.com',
                user: {
                    id: 'user-1',
                    email: 'tenant@test.com',
                },
            };

            (prisma.tenant.findFirst as jest.Mock).mockResolvedValue(tenant);

            const result = await repository.findTenantByEmail('tenant@test.com');

            expect(result).toBe(tenant);
            expect(prisma.tenant.findFirst).toHaveBeenCalledWith({
                where: {
                    email: 'tenant@test.com',
                },
                include: {
                    user: true,
                },
            });
        });
    });

    describe('findTenantForDashboardByUserEmail', () => {
        it('should find a tenant by tenant email or linked user email', async () => {
            const tenant = {
                id: 'tenant-1',
                email: 'tenant@test.com',
            };

            (prisma.tenant.findFirst as jest.Mock).mockResolvedValue(tenant);

            const result = await repository.findTenantForDashboardByUserEmail(
                'tenant@test.com',
            );

            expect(result).toBe(tenant);
            expect(prisma.tenant.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [
                        {
                            email: 'tenant@test.com',
                        },
                        {
                            user: {
                                email: 'tenant@test.com',
                            },
                        },
                    ],
                },
            });
        });
    });

    describe('findActiveLeaseByTenantId', () => {
        it('should find the active lease for a tenant with property included', async () => {
            const lease = {
                id: 'lease-1',
                tenantId: 'tenant-1',
                isActive: true,
                property: {
                    id: 'property-1',
                },
            };

            (prisma.leaseContract.findFirst as jest.Mock).mockResolvedValue(lease);

            const result = await repository.findActiveLeaseByTenantId('tenant-1');

            expect(result).toBe(lease);
            expect(prisma.leaseContract.findFirst).toHaveBeenCalledWith({
                where: {
                    tenantId: 'tenant-1',
                    isActive: true,
                },
                include: {
                    property: true,
                },
            });
        });
    });

    describe('findOpenInvoicesByLeaseId', () => {
        it('should find pending and overdue invoices ordered by due date', async () => {
            const invoices = [
                {
                    id: 'invoice-1',
                    leaseId: 'lease-1',
                    status: 'PENDING',
                    dueDate: new Date('2026-01-01'),
                },
            ];

            (prisma.invoice.findMany as jest.Mock).mockResolvedValue(invoices);

            const result = await repository.findOpenInvoicesByLeaseId('lease-1');

            expect(result).toBe(invoices);
            expect(prisma.invoice.findMany).toHaveBeenCalledWith({
                where: {
                    leaseId: 'lease-1',
                    status: {
                        in: ['PENDING', 'OVERDUE'],
                    },
                },
                orderBy: {
                    dueDate: 'asc',
                },
            });
        });
    });
});