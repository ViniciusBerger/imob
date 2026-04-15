import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsDate, IsDateString } from 'class-validator';

export enum PropertyType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
}

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  registryId?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(PropertyType)
  type: PropertyType;

  @IsNumber()
  @IsOptional()
  landArea?: number;

  @IsNumber()
  @IsOptional()
  builtArea?: number;

  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  floors?: number;

  @IsNumber()
  @IsOptional()
  garage?: number;

  @IsBoolean()
  @IsOptional()
  basement?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  photos?: string[];

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  // Financials
  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsBoolean()
  @IsOptional()
  isFinanced?: boolean;

  @IsString()
  @IsOptional()
  financingType?: string;

  @IsNumber()
  @IsOptional()
  financingTotalValue?: number; // Updated name

  @IsDateString()
  @IsOptional()
  financingStartDate?: string;

  @IsDateString()
  @IsOptional()
  financingEndDate?: string;

  @IsNumber()
  @IsOptional()
  installmentValue?: number;

  @IsNumber()
  @IsOptional()
  financingDueDay?: number;

  @IsNumber()
  @IsOptional()
  installmentsCount?: number;

  @IsNumber()
  @IsOptional()
  installmentsPaid?: number;

  @IsString()
  @IsOptional()
  correctionIndex?: string;

  // Status
  @IsBoolean()
  @IsOptional()
  forSale?: boolean;

  @IsBoolean()
  @IsOptional()
  forRent?: boolean;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @IsOptional()
  rentPrice?: number;
}
