import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './repository/users-prisma.repository';

@Module({
    providers: [UsersService, PrismaService, UsersRepository],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule { }
