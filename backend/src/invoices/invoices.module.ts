import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma.service';
import { INVOICES_REPOSITORY } from './repository/invoices-prisma.interface';
import { InvoicesPrismaRepository } from './repository/invoices-prisma.repository';

/**
 * Invoices module.
 *
 * For now:
 * - service remains the use-case layer
 * - repository owns Prisma access
 * - PrismaService remains the shared DB adapter
 */
@Module({
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    PrismaService,
    InvoicesPrismaRepository,
    {
      provide: INVOICES_REPOSITORY,
      useClass: InvoicesPrismaRepository,
    },
  ],
  exports: [INVOICES_REPOSITORY],
})
export class InvoicesModule {}