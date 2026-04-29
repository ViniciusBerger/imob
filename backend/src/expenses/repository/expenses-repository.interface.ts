export type ExpenseType = 'ONEOFF' | 'RECURRING';

// represents one expense create payload at app level
export type CreateExpenseRecordData = {
    description: string;
    amount: number;
    date: string | Date;
    type: ExpenseType;
    category?: string | null;
    propertyId: string;
};

// represents one expense returned from repository
export type ExpenseRecord = {
    id: string;
    description: string;
    amount: number;
    date: Date;
    type: ExpenseType;
    category?: string | null;
    propertyId: string;
    property?: unknown;
};

// represents the repository contract for expenses persistence
export interface IExpensesRepository {
    create(data: CreateExpenseRecordData): Promise<ExpenseRecord>;
    findAll(): Promise<ExpenseRecord[]>;
    findById(id: string): Promise<ExpenseRecord | null>;
}