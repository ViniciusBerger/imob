import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
    ITenantPortalRepository,
    TenantPortalInvoiceRecord,
    TenantPortalLeaseRecord,
    TenantPortalTenantRecord,
} from './tenant-portal-repository.interface';

@Injectable()
export class TenantPortalRepository implements ITenantPortalRepository {
    constructor(private readonly prisma: PrismaService) {}

    findTenantByEmail(email: string): Promise<TenantPortalTenantRecord | null> {
        return this.prisma.tenant.findFirst({
            where: { email },
            include: {
                user: true,
            },
        }) as Promise<TenantPortalTenantRecord | null>;
    }

    findTenantForDashboardByUserEmail(
        userEmail: string,
    ): Promise<TenantPortalTenantRecord | null> {
        return this.prisma.tenant.findFirst({
            where: {
                OR: [
                    { email: userEmail },
                    {
                        user: {
                            email: userEmail,
                        },
                    },
                ],
            },
        }) as Promise<TenantPortalTenantRecord | null>;
    }

    findActiveLeaseByTenantId(
        tenantId: string,
    ): Promise<TenantPortalLeaseRecord | null> {
        return this.prisma.leaseContract.findFirst({
            where: {
                tenantId,
                isActive: true,
            },
            include: {
                property: true,
            },
        }) as Promise<TenantPortalLeaseRecord | null>;
    }

    findOpenInvoicesByLeaseId(leaseId: string): Promise<TenantPortalInvoiceRecord[]> {
        return this.prisma.invoice.findMany({
            where: {
                leaseId,
                status: {
                    in: ['PENDING', 'OVERDUE'] as any,
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        }) as Promise<TenantPortalInvoiceRecord[]>;
    }
}