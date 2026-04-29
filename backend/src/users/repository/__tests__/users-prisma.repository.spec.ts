import { PrismaService } from '../../../prisma.service';
import { UsersRepository } from '../users-prisma.repository';

describe('UsersPrismaRepository', () => {
    let repository: UsersRepository;

    const prisma = {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn(),
        },
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new UsersRepository(prisma);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findByEmail', () => {
        it('should find a user by email', async () => {
            const user = { id: 'user-1', email: 'test@test.com' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

            const result = await repository.findByEmail('test@test.com');

            expect(result).toBe(user);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@test.com' },
            });
        });
    });

    describe('findById', () => {
        it('should find a user by id', async () => {
            const user = { id: 'user-1' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

            const result = await repository.findById('user-1');

            expect(result).toBe(user);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'user-1' },
            });
        });
    });

    describe('findAll', () => {
        it('should find all users with safe selected fields', async () => {
            const users = [
                {
                    id: 'user-1',
                    name: 'User One',
                    email: 'user@test.com',
                    role: 'ADMIN',
                    createdAt: new Date(),
                },
            ];

            (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

            const result = await repository.findAll();

            expect(result).toBe(users);
            expect(prisma.user.findMany).toHaveBeenCalledWith({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            });
        });
    });

    describe('create', () => {
        it('should create a user without tenant linkage', async () => {
            const user = { id: 'user-1', email: 'new@test.com' };
            (prisma.user.create as jest.Mock).mockResolvedValue(user);

            const result = await repository.create({
                name: 'New User',
                email: 'new@test.com',
                password: 'hashed-password',
                role: 'ADMIN',
            });

            expect(result).toBe(user);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: 'New User',
                    email: 'new@test.com',
                    password: 'hashed-password',
                    role: 'ADMIN',
                    tenantId: null,
                },
            });
        });

        it('should create a tenant-linked user', async () => {
            const user = {
                id: 'user-1',
                email: 'tenant@test.com',
                tenantId: 'tenant-1',
            };

            (prisma.user.create as jest.Mock).mockResolvedValue(user);

            const result = await repository.create({
                name: 'Tenant User',
                email: 'tenant@test.com',
                password: 'hashed-password',
                role: 'TENANT',
                tenantId: 'tenant-1',
            });

            expect(result).toBe(user);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: 'Tenant User',
                    email: 'tenant@test.com',
                    password: 'hashed-password',
                    role: 'TENANT',
                    tenantId: 'tenant-1',
                },
            });
        });
    });

    describe('updateById', () => {
        it('should update a user by id', async () => {
            const user = { id: 'user-1', name: 'Updated User' };
            (prisma.user.update as jest.Mock).mockResolvedValue(user);

            const result = await repository.updateById('user-1', {
                name: 'Updated User',
            });

            expect(result).toBe(user);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: {
                    name: 'Updated User',
                    role: undefined,
                },
            });
        });
    });

    describe('updateResetToken', () => {
        it('should update reset token fields', async () => {
            const expiry = new Date();
            const user = { id: 'user-1' };

            (prisma.user.update as jest.Mock).mockResolvedValue(user);

            const result = await repository.updateResetToken(
                'test@test.com',
                'reset-token',
                expiry,
            );

            expect(result).toBe(user);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { email: 'test@test.com' },
                data: {
                    resetToken: 'reset-token',
                    resetTokenExpiry: expiry,
                },
            });
        });
    });

    describe('findValidByResetToken', () => {
        it('should find a user by valid reset token', async () => {
            const user = { id: 'user-1', resetToken: 'reset-token' };
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);

            const result = await repository.findValidByResetToken('reset-token');

            expect(result).toBe(user);
            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: {
                    resetToken: 'reset-token',
                    resetTokenExpiry: {
                        gt: expect.any(Date),
                    },
                },
            });
        });
    });

    describe('updatePasswordAndClearResetToken', () => {
        it('should update password and clear reset token fields', async () => {
            const user = { id: 'user-1' };
            (prisma.user.update as jest.Mock).mockResolvedValue(user);

            const result = await repository.updatePasswordAndClearResetToken(
                'user-1',
                'new-hashed-password',
            );

            expect(result).toBe(user);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: {
                    password: 'new-hashed-password',
                    resetToken: null,
                    resetTokenExpiry: null,
                },
            });
        });
    });
});