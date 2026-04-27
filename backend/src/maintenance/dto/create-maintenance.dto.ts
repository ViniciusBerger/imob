import { IsString, IsOptional, IsNotEmpty, IsDateString, IsEnum, IsBoolean, IsNumber } from 'class-validator';

export enum MaintenanceStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export class CreateMaintenanceDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    scheduledDate: string;

    @IsEnum(MaintenanceStatus)
    @IsOptional()
    status?: MaintenanceStatus;

    @IsNumber()
    @IsOptional()
    cost?: number;

    priority: string

    @IsBoolean()
    @IsOptional()
    isRecurring?: boolean;

    @IsString()
    @IsOptional()
    frequency?: string;

    @IsString()
    @IsNotEmpty()
    propertyId: string;
}
