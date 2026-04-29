import {
    BadRequestException,
    Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../repository/users-prisma.repository';
import { UsersService } from '../users.service';

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));

describe('UsersService', () => {
    let service: UsersService;

    const usersRepository = {
        findByEmail: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        updateById: jest.fn(),
        updateResetToken: jest.fn(),
        findValidByResetToken: jest.fn(),
        updatePasswordAndClearResetToken: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new UsersService(usersRepository);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

        delete process.env.ENABLE_DEFAULT_ADMIN_BOOTSTRAP;
        delete process.env.DEFAULT_ADMIN_EMAIL;
        delete process.env.DEFAULT_ADMIN_PASSWORD;
    });

    afterEach(() => {
        delete process.env.ENABLE_DEFAULT_ADMIN_BOOTSTRAP;
        delete process.env.DEFAULT_ADMIN_EMAIL;
        delete process.env.DEFAULT_ADMIN_PASSWORD;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should skip default admin bootstrap when feature flag is disabled', async () => {
            await service.onModuleInit();

            expect(usersRepository.findByEmail).not.toHaveBeenCalled();
            expect(usersRepository.create).not.toHaveBeenCalled();
        });

        it('should skip default admin bootstrap when env credentials are missing', async () => {
            process.env.ENABLE_DEFAULT_ADMIN_BOOTSTRAP = 'true';

            const loggerSpy = jest
                .spyOn(Logger.prototype, 'warn')
                .mockImplementation(() => undefined);

            await service.onModuleInit();

            expect(usersRepository.findByEmail).not.toHaveBeenCalled();
            expect(usersRepository.create).not.toHaveBeenCalled();
            expect(loggerSpy).toHaveBeenCalledWith(
                'Default admin bootstrap was enabled but DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD is missing.',
            );
        });

        it('should not create default admin when admin already exists', async () => {
            process.env.ENABLE_DEFAULT_ADMIN_BOOTSTRAP = 'true';
            process.env.DEFAULT_ADMIN_EMAIL = 'admin@test.com';
            process.env.DEFAULT_ADMIN_PASSWORD = 'StrongPassword123!';

            usersRepository.findByEmail.mockResolvedValue({
                id: 'admin-1',
                name: 'Administrador',
                email: 'admin@test.com',
                password: 'hashed-password',
                role: 'ADMIN',
            });

            await service.onModuleInit();

            expect(usersRepository.findByEmail).toHaveBeenCalledWith('admin@test.com');
            expect(usersRepository.create).not.toHaveBeenCalled();
        });

        it('should create default admin when bootstrap is enabled and admin does not exist', async () => {
            process.env.ENABLE_DEFAULT_ADMIN_BOOTSTRAP = 'true';
            process.env.DEFAULT_ADMIN_EMAIL = 'admin@test.com';
            process.env.DEFAULT_ADMIN_PASSWORD = 'StrongPassword123!';

            const loggerSpy = jest
                .spyOn(Logger.prototype, 'warn')
                .mockImplementation(() => undefined);

            usersRepository.findByEmail.mockResolvedValue(null);
            usersRepository.create.mockResolvedValue({
                id: 'admin-1',
                name: 'Administrador',
                email: 'admin@test.com',
                password: 'hashed-password',
                role: 'ADMIN',
            });

            await service.onModuleInit();

            expect(usersRepository.findByEmail).toHaveBeenCalledWith('admin@test.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('StrongPassword123!', 10);
            expect(usersRepository.create).toHaveBeenCalledWith({
                name: 'Administrador',
                email: 'admin@test.com',
                password: 'hashed-password',
                role: 'ADMIN',
            });
            expect(loggerSpy).toHaveBeenCalledWith(
                'Default admin user bootstrapped for admin@test.com',
            );
        });
    });

    describe('findOne', () => {
        it('should find one user by email', async () => {
            const user = {
                id: 'user-1',
                name: 'User One',
                email: 'user@test.com',
                password: 'hashed-password',
                role: 'ADMIN',
            };

            usersRepository.findByEmail.mockResolvedValue(user);

            const result = await service.findOne('user@test.com');

            expect(result).toBe(user);
            expect(usersRepository.findByEmail).toHaveBeenCalledWith('user@test.com');
        });
    });

    describe('findById', () => {
        it('should find one user by id', async () => {
            const user = {
                id: 'user-1',
                name: 'User One',
                email: 'user@test.com',
                password: 'hashed-password',
                role: 'ADMIN',
            };

            usersRepository.findById.mockResolvedValue(user);

            const result = await service.findById('user-1');

            expect(result).toBe(user);
            expect(usersRepository.findById).toHaveBeenCalledWith('user-1');
        });
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const users = [
                {
                    id: 'user-1',
                    name: 'User One',
                    email: 'user@test.com',
                    role: 'ADMIN',
                    createdAt: new Date(),
                },
            ];

            usersRepository.findAll.mockResolvedValue(users);

            const result = await service.findAll();

            expect(result).toBe(users);
            expect(usersRepository.findAll).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should hash password and create user', async () => {
            const createdUser = {
                id: 'user-1',
                name: 'User One',
                email: 'user@test.com',
                password: 'hashed-password',
                role: 'ADMIN',
            };

            usersRepository.create.mockResolvedValue(createdUser);

            const result = await service.create({
                name: 'User One',
                email: 'user@test.com',
                password: 'plain-password',
                role: 'ADMIN',
            });

            expect(result).toBe(createdUser);
            expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);
            expect(usersRepository.create).toHaveBeenCalledWith({
                name: 'User One',
                email: 'user@test.com',
                password: 'hashed-password',
                role: 'ADMIN',
            });
        });

        it('should pass optional tenantId when creating a tenant user', async () => {
            const createdUser = {
                id: 'user-1',
                name: 'Tenant User',
                email: 'tenant@test.com',
                password: 'hashed-password',
                role: 'TENANT',
                tenantId: 'tenant-1',
            };

            usersRepository.create.mockResolvedValue(createdUser);

            const result = await service.create({
                name: 'Tenant User',
                email: 'tenant@test.com',
                password: 'plain-password',
                role: 'TENANT',
                tenantId: 'tenant-1',
            });

            expect(result).toBe(createdUser);
            expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);
            expect(usersRepository.create).toHaveBeenCalledWith({
                name: 'Tenant User',
                email: 'tenant@test.com',
                password: 'hashed-password',
                role: 'TENANT',
                tenantId: 'tenant-1',
            });
        });
    });

    describe('update', () => {
        it('should update user without hashing when password is not provided', async () => {
            const updatedUser = {
                id: 'user-1',
                name: 'Updated User',
                email: 'user@test.com',
                password: 'hashed-password',
                role: 'ADMIN',
            };

            usersRepository.updateById.mockResolvedValue(updatedUser);

            const result = await service.update('user-1', {
                name: 'Updated User',
            });

            expect(result).toBe(updatedUser);
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(usersRepository.updateById).toHaveBeenCalledWith('user-1', {
                name: 'Updated User',
            });
        });

        it('should hash password when password is provided', async () => {
            const updatedUser = {
                id: 'user-1',
                name: 'Updated User',
                email: 'user@test.com',
                password: 'hashed-password',
                role: 'ADMIN',
            };

            usersRepository.updateById.mockResolvedValue(updatedUser);

            const result = await service.update('user-1', {
                password: 'new-password',
            });

            expect(result).toBe(updatedUser);
            expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10);
            expect(usersRepository.updateById).toHaveBeenCalledWith('user-1', {
                password: 'hashed-password',
            });
        });
    });

    describe('updateResetToken', () => {
        it('should update reset token', async () => {
            const expiry = new Date();

            usersRepository.updateResetToken.mockResolvedValue({
                id: 'user-1',
                name: 'User One',
                email: 'user@test.com',
                password: 'hashed-password',
                role: 'ADMIN',
                resetToken: 'token',
                resetTokenExpiry: expiry,
            });

            await service.updateResetToken('user@test.com', 'token', expiry);

            expect(usersRepository.updateResetToken).toHaveBeenCalledWith(
                'user@test.com',
                'token',
                expiry,
            );
        });
    });

    describe('findByResetToken', () => {
        it('should find user by valid reset token', async () => {
            const user = {
                id: 'user-1',
                name: 'User One',
                email: 'user@test.com',
                password: 'hashed-password',
                role: 'ADMIN',
            };

            usersRepository.findValidByResetToken.mockResolvedValue(user);

            const result = await service.findByResetToken('token');

            expect(result).toBe(user);
            expect(usersRepository.findValidByResetToken).toHaveBeenCalledWith('token');
        });
    });

    describe('resetPasswordWithToken', () => {
        it('should throw BadRequestException when token is invalid or expired', async () => {
            usersRepository.findValidByResetToken.mockResolvedValue(null);

            await expect(
                service.resetPasswordWithToken('bad-token', 'new-password'),
            ).rejects.toThrow(BadRequestException);

            await expect(
                service.resetPasswordWithToken('bad-token', 'new-password'),
            ).rejects.toThrow('Invalid or expired token');
        });

        it('should hash password and clear reset token', async () => {
            const user = {
                id: 'user-1',
                name: 'User One',
                email: 'user@test.com',
                password: 'old-password',
                role: 'ADMIN',
            };

            const updatedUser = {
                ...user,
                password: 'hashed-password',
                resetToken: null,
                resetTokenExpiry: null,
            };

            usersRepository.findValidByResetToken.mockResolvedValue(user);
            usersRepository.updatePasswordAndClearResetToken.mockResolvedValue(updatedUser);

            const result = await service.resetPasswordWithToken('token', 'new-password');

            expect(result).toBe(updatedUser);
            expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10);
            expect(usersRepository.updatePasswordAndClearResetToken).toHaveBeenCalledWith(
                'user-1',
                'hashed-password',
            );
        });
    });
});