import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UsersService } from '../../users/users.service';
import { TenantsRepository } from '../repository/tenants-prisma.repository';
import { TenantsService } from '../tenants.service';

jest.mock('crypto', () => ({
    randomBytes: jest.fn(),
}));

describe('TenantsService', () => {
    let service: TenantsService;

    const tenantsRepository = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findTenantById: jest.fn(),
        findUserByEmailOrTenantId: jest.fn(),
        updateById: jest.fn(),
        deleteById: jest.fn(),
    } as unknown as jest.Mocked<TenantsRepository>;

    const usersService = {
        create: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new TenantsService(tenantsRepository, usersService);

        (randomBytes as jest.Mock).mockReturnValue(
            Buffer.from('abcdef1234567890', 'hex'),
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a tenant', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'John Tenant',
                document: '12345678900',
                email: 'tenant@test.com',
                phone: '555-1111',
                profession: 'Engineer',
            };

            tenantsRepository.create.mockResolvedValue(tenant);

            const result = await service.create({
                name: 'John Tenant',
                document: '12345678900',
                email: 'tenant@test.com',
                phone: '555-1111',
                profession: 'Engineer',
            });

            expect(result).toBe(tenant);
            expect(tenantsRepository.create).toHaveBeenCalledWith({
                name: 'John Tenant',
                document: '12345678900',
                email: 'tenant@test.com',
                phone: '555-1111',
                profession: 'Engineer',
            });
        });

        it('should normalize empty optional fields to null', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'John Tenant',
                document: '12345678900',
                email: null,
                phone: null,
                profession: null,
            };

            tenantsRepository.create.mockResolvedValue(tenant);

            await service.create({
                name: 'John Tenant',
                document: '12345678900',
                email: '',
                phone: '',
                profession: '',
            });

            expect(tenantsRepository.create).toHaveBeenCalledWith({
                name: 'John Tenant',
                document: '12345678900',
                email: null,
                phone: null,
                profession: null,
            });
        });

        it('should throw ConflictException when document is duplicated', async () => {
            tenantsRepository.create.mockRejectedValue({ code: 'P2002' });

            await expect(
                service.create({
                    name: 'John Tenant',
                    document: '12345678900',
                    email: null,
                    phone: null,
                }),
            ).rejects.toThrow(ConflictException);

            await expect(
                service.create({
                    name: 'John Tenant',
                    document: '12345678900',
                    email: null,
                    phone: null,
                }),
            ).rejects.toThrow('Já existe um inquilino com este Documento (CPF/CNPJ).');
        });

        it('should rethrow unknown create errors', async () => {
            const error = new Error('Database unavailable');
            tenantsRepository.create.mockRejectedValue(error);

            await expect(
                service.create({
                    name: 'John Tenant',
                    document: '12345678900',
                    email: null,
                    phone: null,
                }),
            ).rejects.toThrow(error);
        });
    });

    describe('createUser', () => {
        it('should throw NotFoundException when tenant does not exist', async () => {
            tenantsRepository.findTenantById.mockResolvedValue(null);

            await expect(service.createUser('tenant-1')).rejects.toThrow(
                NotFoundException,
            );

            await expect(service.createUser('tenant-1')).rejects.toThrow(
                'Inquilino não encontrado.',
            );

            expect(usersService.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when tenant has no email', async () => {
            tenantsRepository.findTenantById.mockResolvedValue({
                id: 'tenant-1',
                name: 'John Tenant',
                document: '12345678900',
                email: null,
                phone: null,
                profession: null,
            });

            await expect(service.createUser('tenant-1')).rejects.toThrow(
                BadRequestException,
            );

            await expect(service.createUser('tenant-1')).rejects.toThrow(
                'Inquilino não possui email cadastrado.',
            );

            expect(usersService.create).not.toHaveBeenCalled();
        });

        it('should throw ConflictException when user already exists for tenant or email', async () => {
            tenantsRepository.findTenantById.mockResolvedValue({
                id: 'tenant-1',
                name: 'John Tenant',
                document: '12345678900',
                email: 'tenant@test.com',
                phone: null,
                profession: null,
            });

            tenantsRepository.findUserByEmailOrTenantId.mockResolvedValue({
                id: 'user-1',
                email: 'tenant@test.com',
                tenantId: 'tenant-1',
            });

            await expect(service.createUser('tenant-1')).rejects.toThrow(
                ConflictException,
            );

            await expect(service.createUser('tenant-1')).rejects.toThrow(
                'Usuário já existe para este inquilino/email.',
            );

            expect(usersService.create).not.toHaveBeenCalled();
        });

        it('should create a user for a tenant with generated temporary password', async () => {
            tenantsRepository.findTenantById.mockResolvedValue({
                id: 'tenant-1',
                name: 'John Tenant',
                document: '12345678900',
                email: 'tenant@test.com',
                phone: null,
                profession: null,
            });

            tenantsRepository.findUserByEmailOrTenantId.mockResolvedValue(null);
            usersService.create.mockResolvedValue({
                id: 'user-1',
                name: 'John Tenant',
                email: 'tenant@test.com',
                password: 'hashed-password',
                role: 'TENANT',
            });

            const result = await service.createUser('tenant-1');

            expect(randomBytes).toHaveBeenCalledWith(8);
            expect(usersService.create).toHaveBeenCalledWith({
                name: 'John Tenant',
                email: 'tenant@test.com',
                password: 'Tmp#A1aabcdef1234567890',
                role: 'TENANT',
                tenantId: 'tenant-1',
            });

            expect(result).toEqual({
                message: 'Usuário criado',
                email: 'tenant@test.com',
                tempPassword: 'Tmp#A1aabcdef1234567890',
            });
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
                    phone: null,
                    profession: null,
                    contract: {},
                    guarantors: [],
                },
            ];

            tenantsRepository.findAll.mockResolvedValue(tenants);

            const result = await service.findAll();

            expect(result).toBe(tenants);
            expect(tenantsRepository.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should find one tenant by id', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'John Tenant',
                document: '12345678900',
                email: 'tenant@test.com',
                phone: null,
                profession: null,
                contract: {},
                guarantors: [],
            };

            tenantsRepository.findById.mockResolvedValue(tenant);

            const result = await service.findOne('tenant-1');

            expect(result).toBe(tenant);
            expect(tenantsRepository.findById).toHaveBeenCalledWith('tenant-1');
        });
    });

    describe('update', () => {
        it('should update a tenant', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'Updated Tenant',
                document: '12345678900',
                email: 'updated@test.com',
                phone: null,
                profession: null,
            };

            tenantsRepository.updateById.mockResolvedValue(tenant);

            const result = await service.update('tenant-1', {
                name: 'Updated Tenant',
                document: '12345678900',
                email: 'updated@test.com',
                phone: '',
                profession: '',
            });

            expect(result).toBe(tenant);
            expect(tenantsRepository.updateById).toHaveBeenCalledWith('tenant-1', {
                name: 'Updated Tenant',
                document: '12345678900',
                email: 'updated@test.com',
                phone: null,
                profession: null,
            });
        });

        it('should throw ConflictException when document is duplicated', async () => {
            tenantsRepository.updateById.mockRejectedValue({ code: 'P2002' });

            await expect(
                service.update('tenant-1', {
                    document: '12345678900',
                }),
            ).rejects.toThrow(ConflictException);

            await expect(
                service.update('tenant-1', {
                    document: '12345678900',
                }),
            ).rejects.toThrow('Já existe um inquilino com este Documento (CPF/CNPJ).');
        });

        it('should rethrow unknown update errors', async () => {
            const error = new Error('Database unavailable');
            tenantsRepository.updateById.mockRejectedValue(error);

            await expect(
                service.update('tenant-1', {
                    name: 'Updated Tenant',
                }),
            ).rejects.toThrow(error);
        });
    });

    describe('remove', () => {
        it('should delete a tenant by id', async () => {
            const tenant = {
                id: 'tenant-1',
                name: 'John Tenant',
                document: '12345678900',
                email: 'tenant@test.com',
                phone: null,
                profession: null,
            };

            tenantsRepository.deleteById.mockResolvedValue(tenant);

            const result = await service.remove('tenant-1');

            expect(result).toBe(tenant);
            expect(tenantsRepository.deleteById).toHaveBeenCalledWith('tenant-1');
        });
    });
});