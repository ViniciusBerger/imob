import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import {
    CreateExpenseRecordData,
} from './repository/expenses-repository.interface';
import { ExpensesRepository } from './repository/expenses-prisma.repository';

@Injectable()
export class ExpensesService {
    constructor(private readonly expensesRepository: ExpensesRepository) {}

    // handles creating one expense
    create(data: CreateExpenseDto) {
        const expenseData: CreateExpenseRecordData = {
            description: data.description,
            amount: data.amount,
            date: data.date,
            type: data.type,
            category: data.category || null,
            propertyId: data.propertyId,
        };

        return this.expensesRepository.create(expenseData);
    }

    // handles finding all expenses
    findAll() {
        return this.expensesRepository.findAll();
    }

    // handles finding one expense by id
    findOne(id: string) {
        return this.expensesRepository.findById(id);
    }
}