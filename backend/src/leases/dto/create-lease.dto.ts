import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum ContractType {
    RENT = 'RENT',
    SALE = 'SALE',
}

export class CreateLeaseDto {
    @IsEnum(ContractType)
    @IsOptional()
    type: ContractType;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsNumber()
    rentValue: number;

    @IsNumber()
    @IsOptional()
    rentDueDay?: number; // 1-31

    @IsNumber()
    @IsOptional()
    adjustmentRate?: number;

    @IsString()
    @IsOptional()
    adjustmentIndex?: string;

    @IsBoolean()
    @IsOptional()
    autoRenew?: boolean;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsNotEmpty()
    propertyId: string;

    @IsString()
    @IsNotEmpty()
    tenantId: string;

    @IsString()
    @IsOptional()
    guarantorId?: string;
}
