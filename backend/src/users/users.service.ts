import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        const adminEmail = 'admin@admin.com';
        const adminExists = await this.prisma.user.findUnique({ where: { email: adminEmail } });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            await this.prisma.user.create({
                data: {
                    name: 'Administrador',
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'ADMIN',
                },
            });
            console.log('Default Admin User Created: admin@admin.com / admin');
        }
    }

    async findOne(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async findAll() {
        return this.prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
    }

    async create(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
    }

    async update(id: string, data: any) {
        const updateData: any = { ...data };
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }

    async updateResetToken(email: string, token: string | null, expiry: Date | null) {
        return this.prisma.user.update({
            where: { email },
            data: { resetToken: token, resetTokenExpiry: expiry }
        });
    }
    async findByResetToken(token: string) {
        return this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });
    }

    async resetPasswordWithToken(token: string, newPass: string) {
        const user = await this.findByResetToken(token);
        if (!user) throw new Error('Invalid or expired token');

        const hashedPassword = await bcrypt.hash(newPass, 10);
        return this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
    }
}
