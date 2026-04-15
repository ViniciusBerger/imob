export class CreateExpenseDto {
    description: string;
    amount: number;
    date: string; // ISO Date
    type: 'ONEOFF' | 'RECURRING';
    category?: string;
    propertyId: string;
}
