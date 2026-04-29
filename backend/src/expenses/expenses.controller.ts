import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CombinedExpensesService } from './combined-expenses.service'; // Added
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('expenses')
@UseGuards(AuthGuard('jwt'))
export class ExpensesController {
    constructor(
        private readonly expensesService: ExpensesService,
        private readonly combinedExpensesService: CombinedExpensesService // Added
    ) { }

    @Post()
    create(@Body() createExpenseDto: CreateExpenseDto) {
        return this.expensesService.create(createExpenseDto);
    }

    @Get()
    findAll() {
        return this.combinedExpensesService.findAllUnified(); // Updated
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.expensesService.findOne(id);
    }
}
