import { TenantsController } from '../tenants.controller';
import { TenantsService } from '../tenants.service';

describe('TenantsController', () => {
    let controller: TenantsController;

    const tenantsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        createUser: jest.fn(),
        remove: jest.fn(),
    } as unknown as jest.Mocked<TenantsService>;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new TenantsController(tenantsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a tenant', async () => {
            const body = {
                name: 'John Tenant',
                document: '12345678900',
                email: 'tenant@test.com',
                phone: '555-1111',
                profession: 'Engineer',
            };

            const tenant = {
                id: 'tenant-1',
                ...body,
            };

            tenantsService.create.mockResolvedValue(tenant as any);

            const result = await controller.create(body);

            expect(result).toBe(tenant);
            expect(tenantsService.create).toHaveBeenCalledWith(body);
        });
    });

    describe('findAll', () => {
        it('should return all tenants', async () => {
            const tenants = [
                {
                    id: 'tenant-1',
                    name: 'John Tenant',
                    document: '12345678900',
                    email: 'tenant@test.com',
                    contract: {},
                    guarantors: [],
                },
            ];

            tenantsService.findAll.mockResolvedValue(tenants as any);

            const result = await controller.findAll();

            expect(result).toBe(tenants);
            expect(tenantsService.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return one tenant by id', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'John Tenant',
                document: '12345678900',
                email: 'tenant@test.com',
                contract: {},
                guarantors: [],
            };

            tenantsService.findOne.mockResolvedValue(tenant as any);

            const result = await controller.findOne('tenant-1');

            expect(result).toBe(tenant);
            expect(tenantsService.findOne).toHaveBeenCalledWith('tenant-1');
        });
    });

    describe('update', () => {
        it('should update a tenant', async () => {
            const body = {
                name: 'Updated Tenant',
                email: 'updated@test.com',
            };

            const tenant = {
                id: 'tenant-1',
                name: 'Updated Tenant',
                document: '12345678900',
                email: 'updated@test.com',
            };

            tenantsService.update.mockResolvedValue(tenant as any);

            const result = await controller.update('tenant-1', body);

            expect(result).toBe(tenant);
            expect(tenantsService.update).toHaveBeenCalledWith('tenant-1', body);
        });
    });

    describe('createUser', () => {
        it('should create a user for a tenant', async () => {
            const response = {
                message: 'Usuário criado',
                email: 'tenant@test.com',
                tempPassword: 'User@123',
            };

            tenantsService.createUser.mockResolvedValue(response);

            const result = await controller.createUser('tenant-1');

            expect(result).toBe(response);
            expect(tenantsService.createUser).toHaveBeenCalledWith('tenant-1');
        });
    });

    describe('remove', () => {
        it('should remove a tenant by id', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'John Tenant',
                document: '12345678900',
            };

            tenantsService.remove.mockResolvedValue(tenant as any);

            const result = await controller.remove('tenant-1');

            expect(result).toBe(tenant);
            expect(tenantsService.remove).toHaveBeenCalledWith('tenant-1');
        });
    });
});