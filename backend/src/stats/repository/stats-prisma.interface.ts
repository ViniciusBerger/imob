import { Prisma } from '@prisma/client';

// interface to objectify expiring contract property relation
export interface IExpiringContractProperty {
    code: string;
    address: string;
    nickname: string | null;
}

// interface to objectify expiring contract result
export interface IExpiringContractRecord {
    id: string;
    endDate: Date;
    property: IExpiringContractProperty;
}

// interface to objectify patrimony data projection
export interface IPropertyPatrimonyRecord {
    purchasePrice: Prisma.Decimal | number | null;
    isFinanced: boolean;
    financingTotalValue: Prisma.Decimal | number | null;
    installmentsCount: number | null;
    installmentsPaid: number | null;
    installmentValue: Prisma.Decimal | number | null;
}

// interface to objectify fixed expense projection
export interface IPropertyExpenseRecord {
    value: Prisma.Decimal | number;
    frequency: string;
}

// interface to objectify financed property monthly installment projection
export interface IFinancedPropertyRecord {
    installmentValue: Prisma.Decimal | number | null;
}

// interface to objectify maintenance cost projection
export interface IMaintenanceCostRecord {
    cost: Prisma.Decimal | number | null;
}

// interface to objectify active lease revenue projection
export interface IActiveLeaseRentRecord {
    rentValue: Prisma.Decimal | number;
}