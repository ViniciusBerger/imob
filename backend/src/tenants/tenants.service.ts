import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TenantsService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService
    ) { }

    async create(data: any) {
        const { name, document, email, phone, profession, ...rest } = data;

        try {
            return await this.prisma.tenant.create({
                data: {
                    name,
                    document,
                    email: email || null,
                    phone: phone || null,
                    profession: profession || null,
                }
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error('Já existe um inquilino com este Documento (CPF/CNPJ).');
            }
            throw error;
        }
    }

    async createUser(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant || !tenant.email) throw new Error("Inquilino não encontrado ou sem email.");

        const existingUser = await this.prisma.user.findFirst({
            where: { OR: [{ email: tenant.email }, { tenantId }] }
        });
        if (existingUser) throw new Error("Usuário já existe para este inquilino/email.");

        const tempPassword = 'User@123';
        // Create User via UsersService (hashes password)
        await this.usersService.create({
            name: tenant.name,
            email: tenant.email,
            password: tempPassword,
            role: 'TENANT',
            tenantId: tenant.id
        });

        return { message: 'Usuário criado', email: tenant.email, tempPassword };
    }

    findAll() {
        return this.prisma.tenant.findMany({ include: { contract: true, guarantors: true } });
    }

    findOne(id: string) {
        return this.prisma.tenant.findUnique({
            where: { id },
            include: { contract: true, guarantors: true },
        });
    }
    async update(id: string, data: any) {
        const { name, document, email, phone, profession } = data;
        try {
            return await this.prisma.tenant.update({
                where: { id },
                data: {
                    name,
                    document,
                    email: email || null,
                    phone: phone || null,
                    profession: profession || null,
                }
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error('Já existe um inquilino com este Documento (CPF/CNPJ).');
            }
            throw error;
        }
    }

    async remove(id: string) {
        return this.prisma.tenant.delete({ where: { id } });
    }
}
