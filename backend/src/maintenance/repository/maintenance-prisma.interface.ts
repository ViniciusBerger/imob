import { MaintenanceStatus, Prisma } from '@prisma/client';

// interface to objectify maintenance with property relation
export type MaintenanceWithProperty = Prisma.MaintenanceGetPayload<{
    include: { property: true }
}>;

// interface to objectify maintenance create data
export interface CreateMaintenanceRecordData {
    title: string;
    description?: string;
    scheduledDate: Date | string;
    status?: MaintenanceStatus;
    cost?: number | string;
    propertyId: string;
}

// interface to objectify maintenance update data
export interface UpdateMaintenanceRecordData {
    title?: string;
    description?: string | null;
    scheduledDate?: Date | string;
    status?: MaintenanceStatus;
    cost?: number | string | null;
    propertyId?: string;
}