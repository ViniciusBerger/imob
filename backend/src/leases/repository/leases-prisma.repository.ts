import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  CreateLeaseRecordData,
  ILeasesRepository,
  InitialRentInvoiceDraft,
  LeaseAdjustmentUpdateData,
  LeaseWithRelations,
  leaseWithRelationsInclude,
  UpdateLeaseRecordData,
} from './leases-prisma.interface'

@Injectable()
export class LeasesRepository implements ILeasesRepository {
    // injects prisma-client adapter
    constructor(private readonly prisma: PrismaService) {}

    // return all leases including relations (property, tenant, guarantor)
    async findAll(): Promise<LeaseWithRelations[]> {
        return this.prisma.leaseContract.findMany({
        where: {
            property: {
            deletedAt: null, // only non-deleted leases
            },
        },
        include: leaseWithRelationsInclude, // include relations
        });
    }

    // find lease including relations (property, tenant, guarantor) by id
    async findById(id: string): Promise<LeaseWithRelations | null> {
        // table name: leaseContract
        return this.prisma.leaseContract.findUnique({
        where: { id },
        include: leaseWithRelationsInclude,
        });
    }

    // find lease without relations (property, tenant, guarantor) by id. 
    async findRawById(id: string) {
        return this.prisma.leaseContract.findUnique({
        where: { id },
        });
    }

    // create a lease and a initial invoid in only one transaction
    async createWithInitialInvoices(leaseData: CreateLeaseRecordData, invoiceDrafts: InitialRentInvoiceDraft[]) {
        // we use a temporary prisma client so if trasaction fails both roll back
        return this.prisma.$transaction(async (temporaryOperationPrisma) => {
            const lease = await temporaryOperationPrisma.leaseContract.create({
                data: {
                ...leaseData,
                },
            });

            // TO DO LATER: DELEGATE TO INVOICES SERVICE
            if (invoiceDrafts.length > 0) {
                await temporaryOperationPrisma.invoice.createMany({
                data: invoiceDrafts.map(
                    (invoice): Prisma.InvoiceCreateManyInput => ({
                    type: invoice.type,
                    description: invoice.description,
                    amount: invoice.amount as any,
                    dueDate: invoice.dueDate,
                    status: invoice.status,
                    leaseId: lease.id,
                    propertyId: invoice.propertyId,
                    }),
                ),
                });
            }

            return lease;
        });
    }


    async updateById(id: string, data: UpdateLeaseRecordData) {
        return this.prisma.leaseContract.update({
        where: { id },
        data: {
            ...data,
        },
        });
    }

    async updateAdjustmentById(id: string, data: LeaseAdjustmentUpdateData) {
        return this.prisma.leaseContract.update({
        where: { id },
        data: {
            rentValue: data.rentValue,
            lastAdjustmentDate: data.lastAdjustmentDate,
            adjustmentRate: data.adjustmentRate,
            notes: data.notes,
        },
        });
    }

    async markInactive(id: string) {
        return this.prisma.leaseContract.update({
        where: { id },
        data: { isActive: false },
        });
    }

    // updates the endDate and notes to keep something like auto-renew flow
    async renewById(id: string, newEndDate: Date, notes: string) {
        return this.prisma.leaseContract.update({
        where: { id },
        data: {
            endDate: newEndDate,
            notes,
        },
        });
    }
}