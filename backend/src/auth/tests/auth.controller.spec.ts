import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

describe('AuthController', () => {
    let controller: AuthController;

    const authServiceMock = {
        validateUser: jest.fn(),
        login: jest.fn(),
        forgotPassword: jest.fn(),
        resetPassword: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: authServiceMock,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    describe('login', () => {
        it('should validate the user and return the login response', async () => {
            const body: LoginDto = {
                email: 'john@example.com',
                password: '123456',
            };

            const validatedUser = {
                id: 'user-1',
                email: 'john@example.com',
                role: 'ADMIN',
                first_name: 'John',
                last_name: 'Doe',
            };

            const loginResponse = {
                access_token: 'jwt-token',
                user: {
                    id: 'user-1',
                    email: 'john@example.com',
                    name: 'John Doe',
                    role: 'ADMIN',
                },
            };

            authServiceMock.validateUser.mockResolvedValue(validatedUser);
            authServiceMock.login.mockResolvedValue(loginResponse);

            const result = await controller.login(body);

            expect(authServiceMock.validateUser).toHaveBeenCalledWith(
                'john@example.com',
                '123456',
            );
            expect(authServiceMock.login).toHaveBeenCalledWith(validatedUser);
            expect(result).toEqual(loginResponse);
        });

        it('should propagate UnauthorizedException when credentials are invalid', async () => {
            const body: LoginDto = {
                email: 'john@example.com',
                password: 'wrong-password',
            };

            authServiceMock.validateUser.mockRejectedValue(
                new UnauthorizedException('Password is invalid!'),
            );

            await expect(controller.login(body)).rejects.toThrow(UnauthorizedException);

            expect(authServiceMock.validateUser).toHaveBeenCalledWith(
                'john@example.com',
                'wrong-password',
            );
            expect(authServiceMock.login).not.toHaveBeenCalled();
        });
    });

    describe('forgotPassword', () => {
        it('should call authService.forgotPassword with the email and return the result', async () => {
            const body: ForgotPasswordDto = {
                email: 'john@example.com',
            };

            authServiceMock.forgotPassword.mockResolvedValue(true);

            const result = await controller.forgotPassword(body);

            expect(authServiceMock.forgotPassword).toHaveBeenCalledWith(
                'john@example.com',
            );
            expect(result).toBe(true);
        });
    });

    describe('resetPassword', () => {
        it('should call authService.resetPassword with token and newPassword and return the result', async () => {
            const body: ResetPasswordDto = {
                token: 'reset-token-123',
                newPassword: 'newStrongPassword',
            };

            authServiceMock.resetPassword.mockResolvedValue(true);

            const result = await controller.resetPassword(body);

            expect(authServiceMock.resetPassword).toHaveBeenCalledWith(
                'reset-token-123',
                'newStrongPassword',
            );
            expect(result).toBe(true);
        });

        it('should return false when authService.resetPassword returns false', async () => {
            const body: ResetPasswordDto = {
                token: 'reset-token-123',
                newPassword: 'newStrongPassword',
            };

            authServiceMock.resetPassword.mockResolvedValue(false);

            const result = await controller.resetPassword(body);

            expect(authServiceMock.resetPassword).toHaveBeenCalledWith(
                'reset-token-123',
                'newStrongPassword',
            );
            expect(result).toBe(false);
        });
    });
});