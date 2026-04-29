export type TenantPortalTenantRecord = {
    id: string;
    name: string;
    email?: string | null;
    user?: unknown;
};

export type TenantPortalLeaseRecord = {
    id: string;
    tenantId: string;
    isActive: boolean;
    property?: unknown;
};

export type TenantPortalInvoiceRecord = {
    id: string;
    leaseId: string;
    status: string;
    dueDate: Date;
};

export interface ITenantPortalRepository {
    findTenantByEmail(email: string): Promise<TenantPortalTenantRecord | null>;
    findTenantForDashboardByUserEmail(userEmail: string): Promise<TenantPortalTenantRecord | null>;
    findActiveLeaseByTenantId(tenantId: string): Promise<TenantPortalLeaseRecord | null>;
    findOpenInvoicesByLeaseId(leaseId: string): Promise<TenantPortalInvoiceRecord[]>;
}