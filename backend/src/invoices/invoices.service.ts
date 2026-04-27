import { Injectable } from '@nestjs/common';
import { InvoicesRepository } from './repository/invoices-prisma.repository';
import {
    CreateInvoiceRecordData,
    FindInvoicesFilters,
    UpdateInvoiceRecordData,
} from './repository/invoices-prisma.interface';

@Injectable()
export class InvoicesService {
    constructor(private invoiceRepo: InvoicesRepository) { }

    // handles creating a invoice delegating persistence to the repository
    create(input: CreateInvoiceRecordData) {
        return this.invoiceRepo.create(input);
    }

    // handles finding all invoices delegating filtering logic to the repository
    findAll(filters?: FindInvoicesFilters) {
        return this.invoiceRepo.findAll(filters);
    }

    // handles finding one invoice by id
    findOne(id: string) {
        return this.invoiceRepo.findById(id);
    }

    // handles updating a invoice by id
    update(id: string, data: UpdateInvoiceRecordData) {
        return this.invoiceRepo.updateById(id, data);
    }

    // handles marking a invoice as paid
    markAsPaid(id: string, paidAmount: number, notes?: string) {
        return this.invoiceRepo.markAsPaidById(id, {
            paidAmount,
            notes,
        });
    }

    // handles removing a invoice by id
    remove(id: string) {
        return this.invoiceRepo.removeById(id);
    }
}