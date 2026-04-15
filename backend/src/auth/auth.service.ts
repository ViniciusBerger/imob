import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

// Minimal user shape used by authentication methods
interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
    name:string
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }


    async validateUser(email: string, pass: string): Promise<AuthenticatedUser> {
        // delegate finding user to service layer. 
        const user = await this.usersService.findOne(email);

        // hashes pass internally and compare with hash stored for password
        if (await bcrypt.compare(pass, user.password)) {
            return {id: user.id, email: user.email, role: user.role, name:user.name}
        } else {
            throw new UnauthorizedException('Password is invalid!')
        }
        
    }


    async login(user: AuthenticatedUser) {
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

    async forgotPassword(email: string): Promise<boolean> {
        // delegate finding user to service layer. 
        const user = await this.usersService.findOne(email);
        const token = randomBytes(32).toString('hex') // generate token 32 bytes to a hex string
        const expiry = new Date();

        expiry.setHours(expiry.getHours() + 1); // 1 hours expiry time
        await this.usersService.updateResetToken(user.email, token, expiry);
        await this.mailService.sendPasswordReset(user.email, token);

        return true;
    }

    async resetPassword(token: string, newPassword: string):Promise<boolean> {
        const user = await this.usersService.findByResetToken(token) 
        const hashPassword = await bcrypt.hash(newPassword, 10) // salt 10 rounds
        // delegate updating user to user service to keep single responsability principle.
        const updateResponse = await this.usersService.update(user.id, { password: hashPassword, resetToken: null, resetTokenExpiry: null})

        if (updateResponse) return true
        return false
        
    }
}
