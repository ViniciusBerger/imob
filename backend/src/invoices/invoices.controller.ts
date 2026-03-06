import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    create(@Body() createInvoiceDto: CreateInvoiceDto) {
        return this.invoicesService.create(createInvoiceDto);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.invoicesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateInvoiceDto: any) {
        return this.invoicesService.update(id, updateInvoiceDto);
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
