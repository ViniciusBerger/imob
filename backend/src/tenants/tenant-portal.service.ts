import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TenantPortalService {
    constructor(private prisma: PrismaService) { }

    async getTenantByEmail(email: string) {
        return this.prisma.tenant.findFirst({
            where: { email }, // Assuming Tenant has email field matching User email
            include: { user: true }
        });
    }

    async getDashboardData(userEmail: string) {
        // 1. Find Tenant
        const tenant = await this.prisma.tenant.findFirst({
            where: { OR: [{ email: userEmail }, { user: { email: userEmail } }] }
        });

        if (!tenant) {
            throw new NotFoundException('Tenant profile not found for this user.');
        }

        // 2. Active Contract
        const activeLease = await this.prisma.leaseContract.findFirst({
            where: {
                tenantId: tenant.id,
                isActive: true
            },
            include: { property: true }
        });

        // 3. Open Invoices
        const openInvoices = activeLease ? await this.prisma.invoice.findMany({
            where: {
                leaseId: activeLease.id,
                status: { in: ['PENDING', 'OVERDUE'] }
            },
            orderBy: { dueDate: 'asc' }
        }) : [];

        return {
            tenant,
            activeLease,
            openInvoices
        };
    }
}
