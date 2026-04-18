interface ICreateLeaseInput {
  startDate: Date | string;
  endDate: Date | string;
  rentValue: number;
  propertyId: string;
  tenantId: string;

  rentDueDay?: number;
  type?: 'RENT' | 'SALE';
  guarantorId?: string;
  adjustmentRate?: number;
  adjustmentIndex?: string;
  autoRenew?: boolean;
  notes?: string;
}