import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  CreateInvoiceRecordData,
  FindInvoicesFilters,
  IInvoicesRepository,
  invoiceWithRelationsInclude,
  MarkInvoiceAsPaidData,
  UpdateInvoiceRecordData,
} from './invoices-prisma.interface';

/**
 * Prisma-backed repository for invoice persistence.
 *
 * This class owns:
 * - Prisma query details
 * - include/where/orderBy/data mapping
 * - DB field conversion (Date / Decimal)
 *
 * This class should NOT own business rules.
 */
@Injectable()
export class InvoicesRepository implements IInvoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Converts app-level numeric input into Prisma Decimal.
   */
  private toDecimal(value: number | string) {
    return new Prisma.Decimal(value);
  }

  /**
   * Converts string-or-Date input into Date.
   */
  private toDate(value: Date | string) {
    return value instanceof Date ? value : new Date(value);
  }

  /**
   * Creates a single invoice record.
   */
  async create(data: CreateInvoiceRecordData) {
    return this.prisma.invoice.create({
      data: {
        type: data.type,
        description: data.description,
        amount: this.toDecimal(data.amount),
        dueDate: this.toDate(data.dueDate),
        status: data.status,
        notes: data.notes,
        leaseId: data.leaseId,
        propertyId: data.propertyId,
      },
    });
  }

  /**
   * Finds invoices using the current filter semantics from InvoicesService.
   *
   * Current rules preserved:
   * - only non-soft-deleted invoices
   * - only invoices whose direct property is active or whose lease property is active
   * - PAYABLE => INSTALLMENT + EXPENSE
   * - RECEIVABLE => RENT
   * - sorted by dueDate ascending
   */
  async findAll(filters?: FindInvoicesFilters) {
    const where: Prisma.InvoiceWhereInput = {
      deletedAt: null,
      OR: [
        { property: { deletedAt: null } },
        { lease: { property: { deletedAt: null } } },
      ],
    };

    if (filters?.leaseId) where.leaseId = filters.leaseId;
    if (filters?.propertyId) where.propertyId = filters.propertyId;
    if (filters?.status) where.status = filters.status;

    if (filters?.type) {
      if (filters.type === 'PAYABLE') {
        where.type = { in: ['INSTALLMENT', 'EXPENSE'] };
      } else if (filters.type === 'RECEIVABLE') {
        where.type = 'RENT';
      } else {
        where.type = filters.type;
      }
    }

    return this.prisma.invoice.findMany({
      where,
      include: invoiceWithRelationsInclude,
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Finds one invoice by id with its current relation shape.
   */
  async findById(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: invoiceWithRelationsInclude,
    });
  }

  /**
   * Updates an invoice by id.
   *
   * Only fields present in the input are sent to Prisma.
   */
    async updateById(id: string, data: UpdateInvoiceRecordData) {
        const updateData = this.validateDataToUpdate(data)

        return this.prisma.invoice.update({
            where: { id },
            data: updateData,
        });

  
    }

    private validateDataToUpdate(data: UpdateInvoiceRecordData){
        const updateData: Prisma.InvoiceUncheckedUpdateInput = {}
        if (data.type !== undefined) updateData.type = data.type;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.amount !== undefined) updateData.amount = this.toDecimal(data.amount);
        if (data.dueDate !== undefined) updateData.dueDate = this.toDate(data.dueDate);
        if (data.status !== undefined) updateData.status = data.status;
        if (data.approvalStatus !== undefined) updateData.approvalStatus = data.approvalStatus;
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.paidAt !== undefined) updateData.paidAt = data.paidAt === null ? null : this.toDate(data.paidAt);
        if (data.leaseId !== undefined) updateData.leaseId = data.leaseId;
        if (data.propertyId !== undefined) updateData.propertyId = data.propertyId;
        if (data.paidAmount !== undefined) {
            updateData.paidAmount =
            data.paidAmount === null ? null : this.toDecimal(data.paidAmount);
        }
        
        return updateData
    }

  /**
   * Marks an invoice as paid using the current service behavior.
   */
  async markAsPaidById(id: string, data: MarkInvoiceAsPaidData) {
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paidAmount: this.toDecimal(data.paidAmount),
        notes: data.notes,
      },
    });
  }

  /**
   * Removes an invoice by id.
   *
   * Preserves current physical delete behavior.
   */
  async removeById(id: string) {
    return this.prisma.invoice.delete({
      where: { id },
    });
  }
}