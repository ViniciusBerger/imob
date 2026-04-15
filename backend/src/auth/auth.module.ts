import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from '../mail/mail.module';

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error('AUTH MODULE => JWT_SCRET is not defined')

@Module({
    imports: [
        UsersModule,
        MailModule,
        PassportModule,
        PassportModule,
        
        JwtModule.register({
            secret: jwtSecret ,
            signOptions: { expiresIn: '1d' },
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
