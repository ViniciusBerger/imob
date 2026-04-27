import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import {
    CreateInvoiceRecordData,
    FindInvoicesFilters,
    UpdateInvoiceRecordData,
} from './repository/invoices-prisma.interface';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    create(@Body() createInvoiceDto: CreateInvoiceDto) {
        const input: CreateInvoiceRecordData = {
            type: createInvoiceDto.type,
            description: createInvoiceDto.description,
            amount: createInvoiceDto.amount,
            dueDate: createInvoiceDto.dueDate,
            status: createInvoiceDto.status,
            leaseId: createInvoiceDto.leaseId,
            propertyId: createInvoiceDto.propertyId,
        };

        return this.invoicesService.create(input);
    }

    @Get()
    findAll(@Query() query: any) {
        const filters: FindInvoicesFilters = {
            leaseId: query.leaseId,
            propertyId: query.propertyId,
            status: query.status,
            type: query.type,
        };

        return this.invoicesService.findAll(filters);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateInvoiceDto: any) {
        const data: UpdateInvoiceRecordData = {
            type: updateInvoiceDto.type,
            description: updateInvoiceDto.description,
            amount: updateInvoiceDto.amount,
            dueDate: updateInvoiceDto.dueDate,
            status: updateInvoiceDto.status,
            approvalStatus: updateInvoiceDto.approvalStatus,
            paidAt: updateInvoiceDto.paidAt,
            paidAmount: updateInvoiceDto.paidAmount,
            notes: updateInvoiceDto.notes,
            leaseId: updateInvoiceDto.leaseId,
            propertyId: updateInvoiceDto.propertyId,
        };

        return this.invoicesService.update(id, data);
    }

    @Patch(':id/pay')
    markAsPaid(@Param('id') id: string, @Body() body: { amount: number, notes?: string }) {
        return this.invoicesService.markAsPaid(id, body.amount, body.notes);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.invoicesService.remove(id);
    }

    @Patch(':id/approve')
    approve(@Param('id') id: string) {
        return this.invoicesService.update(id, { approvalStatus: 'APPROVED' });
    }
}