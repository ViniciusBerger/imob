import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
    CreateTenantRecordData,
    ITenantsRepository,
    TenantRecord,
    TenantUserRecord,
    TenantWithRelations,
    UpdateTenantRecordData,
} from './tenants-repository.interface';

@Injectable()
export class TenantsRepository implements ITenantsRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: CreateTenantRecordData): Promise<TenantRecord> {
        return this.prisma.tenant.create({
            data: {
                name: data.name,
                document: data.document,
                email: data.email || null,
                phone: data.phone || null,
                profession: data.profession || null,
            },
        }) as Promise<TenantRecord>;
    }

    findAll(): Promise<TenantWithRelations[]> {
        return this.prisma.tenant.findMany({
            include: {
                contract: true,
                guarantors: true,
            },
        }) as Promise<TenantWithRelations[]>;
    }

    findById(id: string): Promise<TenantWithRelations | null> {
        return this.prisma.tenant.findUnique({
            where: { id },
            include: {
                contract: true,
                guarantors: true,
            },
        }) as Promise<TenantWithRelations | null>;
    }

    findTenantById(id: string): Promise<TenantRecord | null> {
        return this.prisma.tenant.findUnique({
            where: { id },
        }) as Promise<TenantRecord | null>;
    }

    findUserByEmailOrTenantId(
        email: string,
        tenantId: string,
    ): Promise<TenantUserRecord | null> {
        return this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { tenantId }],
            },
        }) as Promise<TenantUserRecord | null>;
    }

    updateById(id: string, data: UpdateTenantRecordData): Promise<TenantRecord> {
        return this.prisma.tenant.update({
            where: { id },
            data: {
                name: data.name,
                document: data.document,
                email: data.email || null,
                phone: data.phone || null,
                profession: data.profession || null,
            },
        }) as Promise<TenantRecord>;
    }

    deleteById(id: string): Promise<TenantRecord> {
        return this.prisma.tenant.delete({
            where: { id },
        }) as Promise<TenantRecord>;
    }
}