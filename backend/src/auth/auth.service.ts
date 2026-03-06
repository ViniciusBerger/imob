import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            // Silently fail to prevent enumeration or throw error depending on security reqs
            return { message: 'If email exists, reset link sent.' };
        }

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1); // 1 hour expiry

        await this.usersService.updateResetToken(email, token, expiry);
        await this.mailService.sendPasswordReset(email, token);

        return { message: 'If email exists, reset link sent.' };
    }

    async resetPassword(token: string, newPassword: string) {
        // Find user by token (Need to add findByResetToken in UsersService or just iterate? Better add method)
        // For simplicity/performance, let's assume we can query by token or just find user by email if provided? 
        // Typically verify flow is: Click link -> Frontend gets token -> Calls API with token + password.
        // We need to find user by token.
        // Wait, UsersService doesn't have findByToken. I should add it or use findMany.
        // Let's add findByResetToken to UsersService first or use raw query if needed? No, use Prisma.

        // I will add findByResetToken to UsersService.
        // For now, I will use a placeholder and fix UsersService in next step.
        return this.usersService.resetPasswordWithToken(token, newPassword);
    }
}
