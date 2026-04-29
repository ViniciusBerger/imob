export type TenantRecord = {
    id: string;
    name: string;
    document: string;
    email?: string | null;
    phone?: string | null;
    profession?: string | null;
};

export type TenantWithRelations = TenantRecord & {
    contract?: unknown;
    guarantors?: unknown[];
};

export type TenantUserRecord = {
    id: string;
    email: string;
    tenantId?: string | null;
};

export type CreateTenantRecordData = {
    name: string;
    document: string;
    email?: string | null;
    phone?: string | null;
    profession?: string | null;
};

export type UpdateTenantRecordData = {
    name?: string;
    document?: string;
    email?: string | null;
    phone?: string | null;
    profession?: string | null;
};

export interface ITenantsRepository {
    create(data: CreateTenantRecordData): Promise<TenantRecord>;
    findAll(): Promise<TenantWithRelations[]>;
    findById(id: string): Promise<TenantWithRelations | null>;
    findTenantById(id: string): Promise<TenantRecord | null>;
    findUserByEmailOrTenantId(email: string, tenantId: string): Promise<TenantUserRecord | null>;
    updateById(id: string, data: UpdateTenantRecordData): Promise<TenantRecord>;
    deleteById(id: string): Promise<TenantRecord>;
}