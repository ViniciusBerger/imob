export type GuarantorRecord = {
    id: string;
    name: string;
    document: string;
    email?: string | null;
    phone?: string | null;
};

export type GuarantorWithRelations = GuarantorRecord & {
    tenants?: unknown[];
};

export type CreateGuarantorRecordData = {
    name: string;
    document: string;
    email?: string | null;
    phone?: string | null;
};

export type UpdateGuarantorRecordData = {
    name?: string;
    document?: string;
    email?: string | null;
    phone?: string | null;
};

export interface IGuarantorsRepository {
    create(data: CreateGuarantorRecordData): Promise<GuarantorRecord>;
    findAll(): Promise<GuarantorWithRelations[]>;
    findById(id: string): Promise<GuarantorWithRelations | null>;
    updateById(id: string, data: UpdateGuarantorRecordData): Promise<GuarantorRecord>;
    deleteById(id: string): Promise<GuarantorRecord>;
}