import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CombinedExpensesService } from './combined-expenses.service'; // Added
import { ExpensesController } from './expenses.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [ExpensesController],
    providers: [ExpensesService, CombinedExpensesService, PrismaService], // Added
})
export class ExpensesModule { }
