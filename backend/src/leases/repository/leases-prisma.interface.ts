import { LeaseContract, Prisma } from '@prisma/client';

/**
 * Runtime DI token.
 *
 * Important:
 * TypeScript interfaces disappear at runtime, so Nest cannot inject
 * `ILeasesRepository` directly. We use this token for DI instead.
 */
export const LEASES_REPOSITORY = Symbol('LEASES_REPOSITORY');

/** 
 * Type for leasing object with property, tenant and guarantor relations attached 
 * Include object to attach param for lease loading
*/
export const leaseWithRelationsInclude = {
  property: true,
  tenant: true,
  guarantor: true,
} satisfies Prisma.LeaseContractInclude; // Make sure this object is a valid include config for LeaseContract. validate object

/**
 * Type of return for object above `leaseWithRelationsInclude`. Because that would return 
 * Promise<LeaseWithRelations | null>. 
 * 
 * LeaseWithRelations is a reusable return shape of a 
 * query when using that include object
 */
export type LeaseWithRelations = Prisma.LeaseContractGetPayload<{
  include: typeof leaseWithRelationsInclude;
}>;

/**
 * Plain input shape for creating a lease.
 * Keep this as app-level data, not Prisma-specific input types,
 * so the service layer does not need Prisma types.
 */
export interface CreateLeaseRecordData {
  type?: 'RENT' | 'SALE';
  startDate: Date | string;
  endDate: Date | string;
  rentValue: number;
  rentDueDay?: number;
  adjustmentRate?: number;
  adjustmentIndex?: string;
  autoRenew?: boolean;
  notes?: string;
  propertyId: string;
  tenantId: string;
  guarantorId?: string;
}

/**
 * Draft shape for the initial invoices created together with a lease.
 * `leaseId` is intentionally omitted because the repository will attach it
 * after the lease is created inside the transaction.
 */
export interface InitialRentInvoiceDraft {
  type: 'RENT';
  description: string;
  amount: number | string;
  dueDate: Date;
  status: 'PENDING';
  propertyId: string;
}

/**
 * Generic lease update payload for now.
 * This keeps parity with the current `update(id, body)` behavior,
 * but gives us a typed boundary instead of `any`.
 */
export interface UpdateLeaseRecordData {
  type?: 'RENT' | 'SALE';
  startDate?: Date | string;
  endDate?: Date | string;
  rentValue?: number;
  rentDueDay?: number;
  isActive?: boolean;
  adjustmentRate?: number | null;
  adjustmentIndex?: string | null;
  lastAdjustmentDate?: Date | string | null;
  nextAdjustmentDate?: Date | string | null;
  adjustmentBaseMonth?: number | null;
  allowManualAdjustment?: boolean;
  autoRenew?: boolean;
  notes?: string | null;
  propertyId?: string;
  tenantId?: string;
  guarantorId?: string | null;
}

/**
 * Focused payload for rent adjustment persistence.
 * Business logic still belongs in the service;
 * this is only the final DB update shape.
 */
export interface LeaseAdjustmentUpdateData {
  rentValue: number;
  lastAdjustmentDate: Date;
  adjustmentRate: number;
  notes: string;
}

export interface ILeasesRepository {
  /**
   * Returns all non-soft-deleted-property leases with their main relations.
   */
  findAll(): Promise<LeaseWithRelations[]>;

  /**
   * Returns one lease with relations included, or null if not found.
   */
  findById(id: string): Promise<LeaseWithRelations | null>;

  /**
   * Returns one lease without relation includes.
   * Useful for internal service logic such as adjustment calculations.
   */
  findRawById(id: string): Promise<LeaseContract | null>;

  /**
   * Creates a lease and its initial invoices in a single transaction.
   */
  createWithInitialInvoices(
    leaseData: CreateLeaseRecordData,
    invoiceDrafts: InitialRentInvoiceDraft[],
  ): Promise<LeaseContract>;

  /**
   * Updates a lease using a generic partial update payload.
   */
  updateById(id: string, data: UpdateLeaseRecordData): Promise<LeaseContract>;

  /**
   * Persists the result of an applied rent adjustment.
   */
  updateAdjustmentById(
    id: string,
    data: LeaseAdjustmentUpdateData,
  ): Promise<LeaseContract>;

  /**
   * Marks a lease as inactive.
   */
  markInactive(id: string): Promise<LeaseContract>;

  /**
   * Updates end date + notes for auto-renew style flows.
   */
  renewById(id: string, newEndDate: Date, notes: string): Promise<LeaseContract>;
}