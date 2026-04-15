import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(private prisma: PrismaService) { }

    create(data: CreateExpenseDto) {
        return this.prisma.expense.create({
            data: {
                ...data,
                date: new Date(data.date),
            },
        });
    }

    findAll() {
        return this.prisma.expense.findMany({ include: { property: true } });
    }

    findOne(id: string) {
        return this.prisma.expense.findUnique({
            where: { id },
            include: { property: true },
        });
    }
}
