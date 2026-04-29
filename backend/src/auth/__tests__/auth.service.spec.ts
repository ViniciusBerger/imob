import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../mail/mail.service';

describe('AuthService', () => {
    let service: AuthService;

    const usersServiceMock = {
        findOne: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        updateResetToken: jest.fn(),
        findByResetToken: jest.fn(),
        resetPasswordWithToken: jest.fn(),
    };

    const jwtServiceMock = {
        sign: jest.fn(),
    };

    const mailServiceMock = {
        sendPasswordReset: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        service = new AuthService(
            usersServiceMock as unknown as UsersService,
            jwtServiceMock as unknown as JwtService,
            mailServiceMock as unknown as MailService,
        );
    });

    describe('validateUser', () => {
        it('should return the minimal authenticated user when password is valid', async () => {
            const dbUser = {
                id: 'user-1',
                email: 'john@example.com',
                role: 'ADMIN',
                name: 'John Doe',
                password: 'hashed-password',
            };

            usersServiceMock.findOne.mockResolvedValue(dbUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

            const result = await service.validateUser('john@example.com', 'plain-password');

            expect(usersServiceMock.findOne).toHaveBeenCalledWith('john@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('plain-password', 'hashed-password');
            expect(result).toEqual({
                id: 'user-1',
                email: 'john@example.com',
                role: 'ADMIN',
                name: 'John Doe'
            });
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            const dbUser = {
                id: 'user-1',
                email: 'john@example.com',
                role: 'ADMIN',
                first_name: 'John',
                last_name: 'Doe',
                password: 'hashed-password',
            };

            usersServiceMock.findOne.mockResolvedValue(dbUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

            await expect(
                service.validateUser('john@example.com', 'wrong-password'),
            ).rejects.toThrow(UnauthorizedException);

            expect(usersServiceMock.findOne).toHaveBeenCalledWith('john@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
        });
    });

    describe('login', () => {
        it('should sign a jwt and return the access token plus frontend-safe user payload', async () => {
            const authUser = {
                id: 'user-1',
                email: 'john@example.com',
                role: 'ADMIN',
                name: 'John Doe'
            };

            jwtServiceMock.sign.mockReturnValue('signed-jwt-token');

            const result = await service.login(authUser);

            expect(jwtServiceMock.sign).toHaveBeenCalledWith({
                email: 'john@example.com',
                sub: 'user-1',
                role: 'ADMIN',
            });

            expect(result).toEqual({
                access_token: 'signed-jwt-token',
                user: {
                    id: 'user-1',
                    email: 'john@example.com',
                    name: 'John Doe',
                    role: 'ADMIN',
                },
            });
        });
    });

    describe('forgotPassword', () => {
        it('should generate a reset token, persist it, send email, and return true', async () => {
            const dbUser = {
                id: 'user-1',
                email: 'john@example.com',
            };

            usersServiceMock.findOne.mockResolvedValue(dbUser);
            usersServiceMock.updateResetToken.mockResolvedValue(true);
            mailServiceMock.sendPasswordReset.mockResolvedValue(true);

            const before = Date.now();

            const result = await service.forgotPassword('john@example.com');

            expect(result).toBe(true);
            expect(usersServiceMock.findOne).toHaveBeenCalledWith('john@example.com');
            expect(usersServiceMock.updateResetToken).toHaveBeenCalledTimes(1);
            expect(mailServiceMock.sendPasswordReset).toHaveBeenCalledTimes(1);

            const [emailArg, tokenArg, expiryArg] =
                usersServiceMock.updateResetToken.mock.calls[0];

            expect(emailArg).toBe('john@example.com');
            expect(typeof tokenArg).toBe('string');
            expect(tokenArg).toHaveLength(64); // 32 bytes -> 64 hex chars
            expect(expiryArg).toBeInstanceOf(Date);

            const msUntilExpiry = expiryArg.getTime() - before;
            expect(msUntilExpiry).toBeGreaterThanOrEqual(59 * 60 * 1000);
            expect(msUntilExpiry).toBeLessThanOrEqual(61 * 60 * 1000);

            expect(mailServiceMock.sendPasswordReset).toHaveBeenCalledWith(
                'john@example.com',
                tokenArg,
            );
        });
    });

        it('should delegate password reset to UsersService and return true when update succeeds', async () => {
            usersServiceMock.resetPasswordWithToken.mockResolvedValue({
                id: 'user-1',
                email: 'test@test.com',
            });

            const result = await service.resetPassword('reset-token', 'new-password');

            expect(result).toBe(true);
            expect(usersServiceMock.resetPasswordWithToken).toHaveBeenCalledWith(
                'reset-token',
                'new-password',
            );
        });

        it('should throw an error when update does not succeed', async () => {
            usersServiceMock.resetPasswordWithToken.mockResolvedValue(null);

            await expect(
                service.resetPassword('bad-token', 'new-password'),
            ).rejects.toThrow(BadRequestException);

            expect(usersServiceMock.resetPasswordWithToken).toHaveBeenCalledWith(
                'bad-token',
                'new-password',
            );
        });
    });
