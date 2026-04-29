import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { ExpensesRepository } from '../expenses-prisma.repository';

describe('ExpensesRepository', () => {
    let repository: ExpensesRepository;

    const prisma = {
        expense: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new ExpensesRepository(prisma);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('create', () => {
        it('should create one expense and map prisma decimal to number', async () => {
            const prismaExpense = {
                id: 'expense-1',
                description: 'Taxa cartório',
                amount: new Prisma.Decimal(1500.5),
                date: new Date('2026-01-10T00:00:00.000Z'),
                type: 'ONEOFF',
                category: 'LEGAL',
                propertyId: 'property-1',
                property: {
                    id: 'property-1',
                    code: 'PROP-001',
                },
            };

            (prisma.expense.create as jest.Mock).mockResolvedValue(prismaExpense);

            const result = await repository.create({
                description: 'Taxa cartório',
                amount: 1500.5,
                date: '2026-01-10',
                type: 'ONEOFF',
                category: 'LEGAL',
                propertyId: 'property-1',
            });

            expect(prisma.expense.create).toHaveBeenCalledWith({
                data: {
                    description: 'Taxa cartório',
                    amount: 1500.5,
                    date: new Date('2026-01-10'),
                    type: 'ONEOFF',
                    category: 'LEGAL',
                    propertyId: 'property-1',
                },
                include: {
                    property: true,
                },
            });

            expect(result).toEqual({
                id: 'expense-1',
                description: 'Taxa cartório',
                amount: 1500.5,
                date: new Date('2026-01-10T00:00:00.000Z'),
                type: 'ONEOFF',
                category: 'LEGAL',
                propertyId: 'property-1',
                property: {
                    id: 'property-1',
                    code: 'PROP-001',
                },
            });
        });

        it('should normalize empty category to null', async () => {
            const prismaExpense = {
                id: 'expense-1',
                description: 'Conta água',
                amount: new Prisma.Decimal(250),
                date: new Date('2026-01-10T00:00:00.000Z'),
                type: 'RECURRING',
                category: null,
                propertyId: 'property-1',
                property: {
                    id: 'property-1',
                    code: 'PROP-001',
                },
            };

            (prisma.expense.create as jest.Mock).mockResolvedValue(prismaExpense);

            await repository.create({
                description: 'Conta água',
                amount: 250,
                date: '2026-01-10',
                type: 'RECURRING',
                category: null,
                propertyId: 'property-1',
            });

            expect(prisma.expense.create).toHaveBeenCalledWith({
                data: {
                    description: 'Conta água',
                    amount: 250,
                    date: new Date('2026-01-10'),
                    type: 'RECURRING',
                    category: null,
                    propertyId: 'property-1',
                },
                include: {
                    property: true,
                },
            });
        });
    });

    describe('findAll', () => {
        it('should find all expenses and map prisma decimals to numbers', async () => {
            const prismaExpenses = [
                {
                    id: 'expense-1',
                    description: 'Conta água',
                    amount: new Prisma.Decimal(250),
                    date: new Date('2026-01-10T00:00:00.000Z'),
                    type: 'RECURRING',
                    category: null,
                    propertyId: 'property-1',
                    property: {
                        id: 'property-1',
                        code: 'PROP-001',
                    },
                },
            ];

            (prisma.expense.findMany as jest.Mock).mockResolvedValue(prismaExpenses);

            const result = await repository.findAll();

            expect(prisma.expense.findMany).toHaveBeenCalledWith({
                include: {
                    property: true,
                },
            });

            expect(result).toEqual([
                {
                    id: 'expense-1',
                    description: 'Conta água',
                    amount: 250,
                    date: new Date('2026-01-10T00:00:00.000Z'),
                    type: 'RECURRING',
                    category: null,
                    propertyId: 'property-1',
                    property: {
                        id: 'property-1',
                        code: 'PROP-001',
                    },
                },
            ]);
        });
    });

    describe('findById', () => {
        it('should find one expense by id and map prisma decimal to number', async () => {
            const prismaExpense = {
                id: 'expense-1',
                description: 'IPTU',
                amount: new Prisma.Decimal(800),
                date: new Date('2026-01-10T00:00:00.000Z'),
                type: 'ONEOFF',
                category: 'TAX',
                propertyId: 'property-1',
                property: {
                    id: 'property-1',
                    code: 'PROP-001',
                },
            };

            (prisma.expense.findUnique as jest.Mock).mockResolvedValue(prismaExpense);

            const result = await repository.findById('expense-1');

            expect(prisma.expense.findUnique).toHaveBeenCalledWith({
                where: { id: 'expense-1' },
                include: {
                    property: true,
                },
            });

            expect(result).toEqual({
                id: 'expense-1',
                description: 'IPTU',
                amount: 800,
                date: new Date('2026-01-10T00:00:00.000Z'),
                type: 'ONEOFF',
                category: 'TAX',
                propertyId: 'property-1',
                property: {
                    id: 'property-1',
                    code: 'PROP-001',
                },
            });
        });

        it('should return null when expense is not found', async () => {
            (prisma.expense.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await repository.findById('missing-expense');

            expect(result).toBeNull();
            expect(prisma.expense.findUnique).toHaveBeenCalledWith({
                where: { id: 'missing-expense' },
                include: {
                    property: true,
                },
            });
        });
    });
});