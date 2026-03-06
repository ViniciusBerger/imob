import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CombinedExpensesService } from './combined-expenses.service'; // Added
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('expenses')
export class ExpensesController {
    constructor(
        private readonly expensesService: ExpensesService,
        private readonly combinedExpensesService: CombinedExpensesService // Added
    ) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() createExpenseDto: CreateExpenseDto) {
        return this.expensesService.create(createExpenseDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    findAll() {
        return this.combinedExpensesService.findAllUnified(); // Updated
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    findOne(@Param('id') id: string) {
        return this.expensesService.findOne(id);
    }
}
