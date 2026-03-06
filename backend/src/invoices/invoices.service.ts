import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateInvoiceDto, InvoiceStatus } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
    constructor(private prisma: PrismaService) { }

    create(createInvoiceDto: CreateInvoiceDto) {
        return this.prisma.invoice.create({
            data: createInvoiceDto,
        });
    }

    findAll(filters?: any) {
        const where: any = {
            deletedAt: null,
            OR: [
                { property: { deletedAt: null } },
                { lease: { property: { deletedAt: null } } }
            ]
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
            include: {
                lease: { include: { property: true, tenant: true } },
                property: true
            },
            orderBy: { dueDate: 'asc' }
        });
    }

    findOne(id: string) {
        return this.prisma.invoice.findUnique({
            where: { id },
            include: { lease: { include: { property: true, tenant: true } } },
        });
    }

    update(id: string, updateInvoiceDto: any) {
        return this.prisma.invoice.update({
            where: { id },
            data: updateInvoiceDto,
        });
    }

    markAsPaid(id: string, paidAmount: number, notes?: string) {
        return this.prisma.invoice.update({
            where: { id },
            data: {
                status: InvoiceStatus.PAID,
                paidAt: new Date(),
                paidAmount,
                notes
            }
        })
    }

    remove(id: string) {
        return this.prisma.invoice.delete({
            where: { id },
        });
    }
}
