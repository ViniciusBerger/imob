import { Prisma } from '@prisma/client';

/**
 * Runtime DI token for Nest.
 *
 * Important:
 * Interfaces disappear at runtime, so Nest cannot inject an interface directly.
 * We use this token and bind it to the Prisma repository implementation in the module.
 */
export const INVOICES_REPOSITORY = Symbol('INVOICES_REPOSITORY');

/**
 * Reusable include shape for invoice queries that need lease/property/tenant context.
 *
 * This mirrors the current behavior in InvoicesService:
 * - include invoice.property
 * - include invoice.lease with property + tenant
 */
export const invoiceWithRelationsInclude = {
  lease: {
    include: {
      property: true,
      tenant: true,
    },
  },
  property: true,
} satisfies Prisma.InvoiceInclude;

/**
 * Reusable payload type for queries that use invoiceWithRelationsInclude.
 */
export type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: typeof invoiceWithRelationsInclude;
}>;

/**
 * App-level invoice type values.
 *
 * We keep these as plain unions here so the service layer does not need Prisma types.
 */
export type InvoiceRecordType = 'RENT' | 'INSTALLMENT' | 'EXPENSE';

/**
 * App-level invoice status values.
 */
export type InvoiceRecordStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

/**
 * Optional approval status type.
 * Included for forward compatibility with the current Prisma model.
 */
export type InvoiceApprovalRecordStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Input shape for creating an invoice record.
 *
 * This stays close to the current CreateInvoiceDto contract,
 * but lives at the repository boundary instead of importing Prisma types.
 */
export interface CreateInvoiceRecordData {
  type: InvoiceRecordType;
  description: string;
  amount: number | string;
  dueDate: Date | string;
  status?: InvoiceRecordStatus;
  notes?: string;
  leaseId?: string;
  propertyId?: string;
}

/**
 * Current list filters supported by the invoices slice.
 *
 * PAYABLE and RECEIVABLE are view-level filters that get translated into
 * concrete invoice types inside the repository.
 */
export interface FindInvoicesFilters {
  leaseId?: string;
  propertyId?: string;
  status?: InvoiceRecordStatus;
  type?: InvoiceRecordType | 'PAYABLE' | 'RECEIVABLE';
}

/**
 * Generic update payload for invoices.
 *
 * This intentionally stays broad enough to preserve current service behavior
 * while still removing raw `any` from the Prisma access layer.
 */
export interface UpdateInvoiceRecordData {
  type?: InvoiceRecordType;
  description?: string;
  amount?: number | string;
  dueDate?: Date | string;
  status?: InvoiceRecordStatus;
  approvalStatus?: InvoiceApprovalRecordStatus;
  paidAt?: Date | string | null;
  paidAmount?: number | string | null;
  notes?: string | null;
  leaseId?: string | null;
  propertyId?: string | null;
}

/**
 * Focused payload for marking an invoice as paid.
 */
export interface MarkInvoiceAsPaidData {
  paidAmount: number | string;
  notes?: string;
}

/**
 * Contract for the invoices persistence boundary.
 *
 * The service layer should use this interface.
 * The Prisma repository implementation will satisfy it.
 */
export interface IInvoicesRepository {
  /**
   * Creates one invoice row.
   */
  create(data: CreateInvoiceRecordData): Promise<Prisma.InvoiceGetPayload<{}>>;

  /**
   * Returns invoices using the current list filtering behavior.
   */
  findAll(filters?: FindInvoicesFilters): Promise<InvoiceWithRelations[]>;

  /**
   * Returns one invoice with main relations, or null if not found.
   */
  findById(id: string): Promise<InvoiceWithRelations | null>;

  /**
   * Updates an invoice by id.
   */
  updateById(
    id: string,
    data: UpdateInvoiceRecordData,
  ): Promise<Prisma.InvoiceGetPayload<{}>>;

  /**
   * Marks an invoice as paid.
   */
  markAsPaidById(
    id: string,
    data: MarkInvoiceAsPaidData,
  ): Promise<Prisma.InvoiceGetPayload<{}>>;

  /**
   * Removes an invoice by id.
   *
   * Note:
   * This preserves the current physical delete behavior from the service.
   * If you later choose soft delete, this method can change internally
   * without changing the service contract.
   */
  removeById(id: string): Promise<Prisma.InvoiceGetPayload<{}>>;
}