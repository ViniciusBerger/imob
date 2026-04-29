import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
    CreateExpenseRecordData,
    ExpenseRecord,
    IExpensesRepository,
} from './expenses-repository.interface';

type ExpenseWithProperty = Prisma.ExpenseGetPayload<{
    include: { property: true };
}>;

@Injectable()
export class ExpensesRepository implements IExpensesRepository {
    constructor(private readonly prisma: PrismaService) {}

    // handles creating one expense
    async create(data: CreateExpenseRecordData): Promise<ExpenseRecord> {
        const expense = await this.prisma.expense.create({
            data: {
                description: data.description,
                amount: data.amount,
                date: new Date(data.date),
                type: data.type,
                category: data.category || null,
                propertyId: data.propertyId,
            },
            include: {
                property: true,
            },
        });

        return this.toExpenseRecord(expense);
    }

    // handles finding all expenses
    async findAll(): Promise<ExpenseRecord[]> {
        const expenses = await this.prisma.expense.findMany({
            include: {
                property: true,
            },
        });

        return expenses.map((expense) => this.toExpenseRecord(expense));
    }

    // handles finding one expense by id
    async findById(id: string): Promise<ExpenseRecord | null> {
        const expense = await this.prisma.expense.findUnique({
            where: { id },
            include: {
                property: true,
            },
        });

        if (!expense) {
            return null;
        }

        return this.toExpenseRecord(expense);
    }

    // handles mapping one prisma expense into app-level expense record
    private toExpenseRecord(expense: ExpenseWithProperty): ExpenseRecord {
        return {
            id: expense.id,
            description: expense.description,
            amount: this.toNumber(expense.amount),
            date: expense.date,
            type: expense.type,
            category: expense.category ?? null,
            propertyId: expense.propertyId,
            property: expense.property,
        };
    }

    // handles converting prisma decimal values into number
    private toNumber(value: Prisma.Decimal | number): number {
        if (typeof value === 'number') {
            return value;
        }

        return value.toNumber();
    }
}