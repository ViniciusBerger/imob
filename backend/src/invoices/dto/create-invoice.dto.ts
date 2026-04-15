import { IsString, IsNotEmpty, IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';

export enum InvoiceType {
    RENT = 'RENT',
    INSTALLMENT = 'INSTALLMENT',
    EXPENSE = 'EXPENSE',
}

export enum InvoiceStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
}

export class CreateInvoiceDto {
    @IsEnum(InvoiceType)
    type: InvoiceType;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    amount: number;

    @IsDateString()
    dueDate: string;

    @IsEnum(InvoiceStatus)
    @IsOptional()
    status?: InvoiceStatus;

    @IsString()
    @IsOptional()
    leaseId?: string;

    // Optional propertyId if we decide to link straight to property later
    @IsString()
    @IsOptional()
    propertyId?: string;
}
