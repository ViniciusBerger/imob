import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateGuarantorDto } from './dto/create-guarantor.dto';

@Injectable()
export class GuarantorsService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const { name, document, email, phone, ...rest } = data;
        try {
            return await this.prisma.guarantor.create({
                data: {
                    name,
                    document,
                    email: email || null,
                    phone: phone || null,
                }
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error('Já existe um fiador com este Documento (CPF).');
            }
            throw error;
        }
    }

    findAll() {
        return this.prisma.guarantor.findMany({ include: { tenants: true } });
    }

    findOne(id: string) {
        return this.prisma.guarantor.findUnique({
            where: { id },
            include: { tenants: true },
        });
    }
    async update(id: string, data: any) {
        const { name, document, email, phone } = data;
        try {
            return await this.prisma.guarantor.update({
                where: { id },
                data: {
                    name,
                    document,
                    email: email || null,
                    phone: phone || null,
                }
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error('Já existe um fiador com este Documento (CPF).');
            }
            throw error;
        }
    }

    async remove(id: string) {
        return this.prisma.guarantor.delete({ where: { id } });
    }
}
