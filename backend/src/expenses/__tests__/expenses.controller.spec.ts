import { CombinedExpensesService } from '../combined-expenses.service';
import { ExpensesController } from '../expenses.controller';
import { ExpensesService } from '../expenses.service';
import { ExpenseRecord } from '../repository/expenses-repository.interface';

describe('ExpensesController', () => {
    let controller: ExpensesController;

    const expensesService = {
        create: jest.fn(),
        findOne: jest.fn(),
    } as unknown as jest.Mocked<ExpensesService>;

    const combinedExpensesService = {
        findAllUnified: jest.fn(),
    } as unknown as jest.Mocked<CombinedExpensesService>;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new ExpensesController(
            expensesService,
            combinedExpensesService,
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create one expense', async () => {
            const dto = {
                description: 'Conta água',
                amount: 250,
                date: '2026-01-10',
                type: 'RECURRING' as const,
                category: 'UTILITIES',
                propertyId: 'property-1',
            };

            const expense = {
                id: 'expense-1',
                ...dto,
                date: new Date('2026-01-10T00:00:00.000Z'),
            };

            expensesService.create.mockResolvedValue(expense);

            const result = await controller.create(dto);

            expect(result).toBe(expense);
            expect(expensesService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return all unified expenses', async () => {
            const expenses = [
                {
                    id: 'expense-1',
                    description: 'Conta água',
                    category: 'UTILITIES',
                    date: new Date('2026-01-10T00:00:00.000Z'),
                    amount: 250,
                    property: {
                        address: 'Rua Central, 123',
                        nickname: 'Apartamento Centro',
                    },
                },
            ];

            combinedExpensesService.findAllUnified.mockResolvedValue(expenses);

            const result = await controller.findAll();

            expect(result).toBe(expenses);
            expect(combinedExpensesService.findAllUnified).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return one expense by id', async () => {
            const expense:ExpenseRecord = {
                id: 'expense-1',
                description: 'Conta água',
                amount: 250,
                date: new Date('2026-01-10T00:00:00.000Z'),
                type: 'RECURRING',
                category: 'UTILITIES',
                propertyId: 'property-1',
            };

            expensesService.findOne.mockResolvedValue(expense);

            const result = await controller.findOne('expense-1');

            expect(result).toBe(expense);
            expect(expensesService.findOne).toHaveBeenCalledWith('expense-1');
        });

        it('should return null when expense is not found', async () => {
            expensesService.findOne.mockResolvedValue(null);

            const result = await controller.findOne('missing-expense');

            expect(result).toBeNull();
            expect(expensesService.findOne).toHaveBeenCalledWith('missing-expense');
        });
    });
});