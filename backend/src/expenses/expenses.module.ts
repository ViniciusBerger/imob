import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CombinedExpensesService } from './combined-expenses.service';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { ExpensesRepository } from './repository/expenses-prisma.repository';

@Module({
    controllers: [ExpensesController],
    providers: [
        ExpensesService,
        CombinedExpensesService,
        ExpensesRepository,
        PrismaService,
    ],
    exports: [ExpensesService],
})
export class ExpensesModule {}