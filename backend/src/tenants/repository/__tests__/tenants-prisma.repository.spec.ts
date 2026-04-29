import { PrismaService } from '../../../prisma.service';
import { TenantsRepository } from '../tenants-prisma.repository';

describe('TenantsRepository', () => {
    let repository: TenantsRepository;

    const prisma = {
        tenant: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        user: {
            findFirst: jest.fn(),
        },
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new TenantsRepository(prisma);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('create', () => {
        it('should create a tenant with nullable optional fields', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'John Tenant',
                document: '12345678900',
                email: null,
                phone: null,
                profession: null,
            };

            (prisma.tenant.create as jest.Mock).mockResolvedValue(tenant);

            const result = await repository.create({
                name: 'John Tenant',
                document: '12345678900',
                email: '',
                phone: '',
                profession: '',
            });

            expect(result).toBe(tenant);
            expect(prisma.tenant.create).toHaveBeenCalledWith({
                data: {
                    name: 'John Tenant',
                    document: '12345678900',
                    email: null,
                    phone: null,
                    profession: null,
                },
            });
        });

        it('should create a tenant with provided optional fields', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'John Tenant',
                document: '12345678900',
                email: 'tenant@test.com',
                phone: '555-1111',
                profession: 'Engineer',
            };

            (prisma.tenant.create as jest.Mock).mockResolvedValue(tenant);

            const result = await repository.create({
                name: 'John Tenant',
                document: '12345678900',
                email: 'tenant@test.com',
                phone: '555-1111',
                profession: 'Engineer',
            });

            expect(result).toBe(tenant);
            expect(prisma.tenant.create).toHaveBeenCalledWith({
                data: {
                    name: 'John Tenant',
                    document: '12345678900',
                    email: 'tenant@test.com',
                    phone: '555-1111',
                    profession: 'Engineer',
                },
            });
        });
    });

    describe('findAll', () => {
        it('should find all tenants with contract and guarantors', async () => {
            const tenants = [{ id: 'tenant-1' }];
            (prisma.tenant.findMany as jest.Mock).mockResolvedValue(tenants);

            const result = await repository.findAll();

            expect(result).toBe(tenants);
            expect(prisma.tenant.findMany).toHaveBeenCalledWith({
                include: {
                    contract: true,
                    guarantors: true,
                },
            });
        });
    });

    describe('findById', () => {
        it('should find a tenant by id with contract and guarantors', async () => {
            const tenant = { id: 'tenant-1' };
            (prisma.tenant.findUnique as jest.Mock).mockResolvedValue(tenant);

            const result = await repository.findById('tenant-1');

            expect(result).toBe(tenant);
            expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
                where: { id: 'tenant-1' },
                include: {
                    contract: true,
                    guarantors: true,
                },
            });
        });
    });

    describe('findTenantById', () => {
        it('should find a tenant by id without relations', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'John Tenant',
                email: 'tenant@test.com',
            };

            (prisma.tenant.findUnique as jest.Mock).mockResolvedValue(tenant);

            const result = await repository.findTenantById('tenant-1');

            expect(result).toBe(tenant);
            expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
                where: { id: 'tenant-1' },
            });
        });
    });

    describe('findUserByEmailOrTenantId', () => {
        it('should find a user by email or tenantId', async () => {
            const user = {
                id: 'user-1',
                email: 'tenant@test.com',
                tenantId: 'tenant-1',
            };

            (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);

            const result = await repository.findUserByEmailOrTenantId(
                'tenant@test.com',
                'tenant-1',
            );

            expect(result).toBe(user);
            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [{ email: 'tenant@test.com' }, { tenantId: 'tenant-1' }],
                },
            });
        });
    });

    describe('updateById', () => {
        it('should update a tenant by id', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'Updated Tenant',
            };

            (prisma.tenant.update as jest.Mock).mockResolvedValue(tenant);

            const result = await repository.updateById('tenant-1', {
                name: 'Updated Tenant',
                document: '12345678900',
                email: '',
                phone: '',
                profession: '',
            });

            expect(result).toBe(tenant);
            expect(prisma.tenant.update).toHaveBeenCalledWith({
                where: { id: 'tenant-1' },
                data: {
                    name: 'Updated Tenant',
                    document: '12345678900',
                    email: null,
                    phone: null,
                    profession: null,
                },
            });
        });
    });

    describe('deleteById', () => {
        it('should delete a tenant by id', async () => {
            const tenant = { id: 'tenant-1' };
            (prisma.tenant.delete as jest.Mock).mockResolvedValue(tenant);

            const result = await repository.deleteById('tenant-1');

            expect(result).toBe(tenant);
            expect(prisma.tenant.delete).toHaveBeenCalledWith({
                where: { id: 'tenant-1' },
            });
        });
    });
});