import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
    CreateUserRecordData,
    UpdateUserRecordData,
    UserListItem,
    UserRecord,
    IUsersRepository,
} from './users-repository.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    findByEmail(email: string): Promise<UserRecord | null> {
        return this.prisma.user.findUnique({
            where: { email },
        }) as Promise<UserRecord | null>;
    }

    findById(id: string): Promise<UserRecord | null> {
        return this.prisma.user.findUnique({
            where: { id },
        }) as Promise<UserRecord | null>;
    }

    findAll(): Promise<UserListItem[]> {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        }) as Promise<UserListItem[]>;
    }

    create(data: CreateUserRecordData): Promise<UserRecord> {
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role as any,
                tenantId: data.tenantId ?? null,
            },
        }) as Promise<UserRecord>;
    }

    updateById(id: string, data: UpdateUserRecordData): Promise<UserRecord> {
        return this.prisma.user.update({
            where: { id },
            data: {
                ...data,
                role: data.role as any,
            },
        }) as Promise<UserRecord>;
    }

    updateResetToken(
        email: string,
        token: string | null,
        expiry: Date | null,
    ): Promise<UserRecord> {
        return this.prisma.user.update({
            where: { email },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry,
            },
        }) as Promise<UserRecord>;
    }

    findValidByResetToken(token: string): Promise<UserRecord | null> {
        return this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        }) as Promise<UserRecord | null>;
    }

    updatePasswordAndClearResetToken(
        id: string,
        hashedPassword: string,
    ): Promise<UserRecord> {
        return this.prisma.user.update({
            where: { id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        }) as Promise<UserRecord>;
    }
}