import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
    CreateGuarantorRecordData,
    GuarantorRecord,
    GuarantorWithRelations,
    IGuarantorsRepository,
    UpdateGuarantorRecordData,
} from './guarantors-repository.interface';

@Injectable()
export class GuarantorsRepository implements IGuarantorsRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: CreateGuarantorRecordData): Promise<GuarantorRecord> {
        return this.prisma.guarantor.create({
            data: {
                name: data.name,
                document: data.document,
                email: data.email || null,
                phone: data.phone || null,
            },
        }) as Promise<GuarantorRecord>;
    }

    findAll(): Promise<GuarantorWithRelations[]> {
        return this.prisma.guarantor.findMany({
            include: {
                tenants: true,
            },
        }) as Promise<GuarantorWithRelations[]>;
    }

    findById(id: string): Promise<GuarantorWithRelations | null> {
        return this.prisma.guarantor.findUnique({
            where: { id },
            include: {
                tenants: true,
            },
        }) as Promise<GuarantorWithRelations | null>;
    }

    updateById(
        id: string,
        data: UpdateGuarantorRecordData,
    ): Promise<GuarantorRecord> {
        return this.prisma.guarantor.update({
            where: { id },
            data: {
                name: data.name,
                document: data.document,
                email: data.email || null,
                phone: data.phone || null,
            },
        }) as Promise<GuarantorRecord>;
    }

    deleteById(id: string): Promise<GuarantorRecord> {
        return this.prisma.guarantor.delete({
            where: { id },
        }) as Promise<GuarantorRecord>;
    }
}