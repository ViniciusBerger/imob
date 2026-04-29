import { ExpensesService } from '../expenses.service';
import { ExpensesRepository } from '../repository/expenses-prisma.repository';
import { ExpenseRecord } from '../repository/expenses-repository.interface';

describe('ExpensesService', () => {
    let service: ExpensesService;

    const expensesRepository = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
    } as unknown as jest.Mocked<ExpensesRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new ExpensesService(expensesRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should map dto to repository input and create one expense', async () => {
            const expense: ExpenseRecord = {
                id: 'expense-1',
                description: 'Conta água',
                amount: 250,
                date: new Date('2026-01-10T00:00:00.000Z'),
                type: 'RECURRING',
                category: 'UTILITIES',
                propertyId: 'property-1',
                property: {
                    id: 'property-1',
                    code: 'PROP-001',
                },
            };

            expensesRepository.create.mockResolvedValue(expense);

            const result = await service.create({
                description: 'Conta água',
                amount: 250,
                date: '2026-01-10',
                type: 'RECURRING',
                category: 'UTILITIES',
                propertyId: 'property-1',
            });

            expect(result).toBe(expense);
            expect(expensesRepository.create).toHaveBeenCalledWith({
                description: 'Conta água',
                amount: 250,
                date: '2026-01-10',
                type: 'RECURRING',
                category: 'UTILITIES',
                propertyId: 'property-1',
            });
        });

        it('should normalize empty category to null', async () => {
            expensesRepository.create.mockResolvedValue({
                id: 'expense-1',
                description: 'Conta água',
                amount: 250,
                date: new Date('2026-01-10T00:00:00.000Z'),
                type: 'RECURRING',
                category: null,
                propertyId: 'property-1',
            });

            await service.create({
                description: 'Conta água',
                amount: 250,
                date: '2026-01-10',
                type: 'RECURRING',
                category: '',
                propertyId: 'property-1',
            });

            expect(expensesRepository.create).toHaveBeenCalledWith({
                description: 'Conta água',
                amount: 250,
                date: '2026-01-10',
                type: 'RECURRING',
                category: null,
                propertyId: 'property-1',
            });
        });
    });

    describe('findAll', () => {
        it('should return all expenses', async () => {
            const expenses: ExpenseRecord[] = [
                {
                    id: 'expense-1',
                    description: 'Conta água',
                    amount: 250,
                    date: new Date('2026-01-10T00:00:00.000Z'),
                    type: 'RECURRING',
                    category: null,
                    propertyId: 'property-1',
                },
            ];

            expensesRepository.findAll.mockResolvedValue(expenses);

            const result = await service.findAll();

            expect(result).toBe(expenses);
            expect(expensesRepository.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return one expense by id', async () => {
            const expense: ExpenseRecord = {
                id: 'expense-1',
                description: 'IPTU',
                amount: 800,
                date: new Date('2026-01-10T00:00:00.000Z'),
                type: 'ONEOFF',
                category: 'TAX',
                propertyId: 'property-1',
            };

            expensesRepository.findById.mockResolvedValue(expense);

            const result = await service.findOne('expense-1');

            expect(result).toBe(expense);
            expect(expensesRepository.findById).toHaveBeenCalledWith('expense-1');
        });

        it('should return null when expense is not found', async () => {
            expensesRepository.findById.mockResolvedValue(null);

            const result = await service.findOne('missing-expense');

            expect(result).toBeNull();
            expect(expensesRepository.findById).toHaveBeenCalledWith('missing-expense');
        });
    });
});