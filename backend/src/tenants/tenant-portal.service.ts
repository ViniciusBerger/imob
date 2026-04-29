import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantPortalRepository } from './repository/tenant-portal-prisma.repository';

@Injectable()
export class TenantPortalService {
    constructor(private readonly tenantPortalRepository: TenantPortalRepository) {}

    getTenantByEmail(email: string) {
        return this.tenantPortalRepository.findTenantByEmail(email);
    }

    async getDashboardData(userEmail: string) {
        const tenant =
            await this.tenantPortalRepository.findTenantForDashboardByUserEmail(userEmail);

        if (!tenant) {
            throw new NotFoundException('Tenant profile not found for this user.');
        }

        const activeLease = await this.tenantPortalRepository.findActiveLeaseByTenantId(
            tenant.id,
        );

        const openInvoices = activeLease
            ? await this.tenantPortalRepository.findOpenInvoicesByLeaseId(activeLease.id)
            : [];

        return {
            tenant,
            activeLease,
            openInvoices,
        };
    }
}