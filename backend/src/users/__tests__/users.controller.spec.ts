import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
    let controller: UsersController;

    const usersService = {
        create: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new UsersController(usersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a user', async () => {
            const body = {
                name: 'User One',
                email: 'user@test.com',
                password: 'password123',
                role: 'ADMIN',
            };

            const createdUser = {
                id: 'user-1',
                name: 'User One',
                email: 'user@test.com',
                role: 'ADMIN',
            };

            usersService.create.mockResolvedValue(createdUser as any);

            const result = await controller.create(body);

            expect(result).toBe(createdUser);
            expect(usersService.create).toHaveBeenCalledWith(body);
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

            usersService.findAll.mockResolvedValue(users as any);

            const result = await controller.findAll();

            expect(result).toBe(users);
            expect(usersService.findAll).toHaveBeenCalled();
        });
    });

    describe('getProfile', () => {
        it('should return the authenticated user from request', () => {
            const req = {
                user: {
                    id: 'user-1',
                    email: 'user@test.com',
                    role: 'ADMIN',
                },
            };

            const result = controller.getProfile(req);

            expect(result).toBe(req.user);
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const body = {
                name: 'Updated User',
            };

            const updatedUser = {
                id: 'user-1',
                name: 'Updated User',
                email: 'user@test.com',
                role: 'ADMIN',
            };

            usersService.update.mockResolvedValue(updatedUser as any);

            const result = await controller.update('user-1', body);

            expect(result).toBe(updatedUser);
            expect(usersService.update).toHaveBeenCalledWith('user-1', body);
        });
    });
});