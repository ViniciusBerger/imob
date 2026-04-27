import { Prisma, PropertyType } from '@prisma/client';

// interface to objectify full property details relation payload
export type PropertyWithDetails = Prisma.PropertyGetPayload<{
    include: {
        leases: {
            include: {
                tenant: true,
                invoices: true
            }
        },
        documents: true,
        maintenances: true,
        expenses: true,
        propertyExpenses: true,
        notes: true,
        invoices: true,
    }
}>;

// interface to objectify property create data
export interface CreatePropertyRecordData {
    code: string;
    address: string;
    type: PropertyType;

    nickname?: string;
    description?: string;
    purchasePrice?: number | string | null;
    currentValue?: number | string | null;
    installmentValue?: number | string | null;
    financingTotalValue?: number | string | null;
    installmentsCount?: number | null;
    installmentsPaid?: number | null;
    financingEndDate?: Date | string | null;
    isFinanced?: boolean;
    photos?: string[];
}

// interface to objectify property update data
export interface UpdatePropertyRecordData {
    code?: string;
    title?: string;
    address?: string;
    nickname?: string;
    description?: string | null;
    purchasePrice?: number | string | null;
    currentValue?: number | string | null;
    installmentValue?: number | string | null;
    financingTotalValue?: number | string | null;
    installmentsCount?: number | null;
    installmentsPaid?: number | null;
    financingEndDate?: Date | string | null;
    isFinanced?: boolean;
    photos?: string[];
    deletedAt?: Date | null;
    [key: string]: any;
}

// interface to objectify property document create data
export interface CreatePropertyDocumentRecordData {
    title: string;
    filePath: string;
    fileType: string;
    propertyId: string;
}

// interface to objectify expense create data
export interface CreateExpenseRecordData {
    description?: string;
    amount: number | string;
    date: Date | string;
    type: string;
    status?: string;
}

// interface to objectify fixed property expense create data
export interface CreatePropertyExpenseRecordData {
    name: string;
    value: number | string;
    frequency?: string;
    dueDay?: number;
}

// interface to objectify property note create data
export interface CreatePropertyNoteRecordData {
    content: string;
    propertyId: string;
    userId: string;
}