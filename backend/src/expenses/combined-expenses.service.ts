import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CombinedExpensesService {
    constructor(private prisma: PrismaService) { }

    async findAllUnified() {
        // 1. Fixed Expenses
        const fixedExpenses = await this.prisma.propertyExpense.findMany({
            include: { property: { select: { address: true, nickname: true } } }
        });

        // 2. Maintenance with Cost
        const maintenance = await this.prisma.maintenance.findMany({
            where: { cost: { not: null } },
            include: { property: { select: { address: true, nickname: true } } }
        });

        // 3. Normalize
        const normalizedFixed = fixedExpenses.map(e => ({
            id: `fixed-${e.id}`,
            description: e.name, // Fixed: title -> name
            category: 'FIXED',
            date: new Date(),
            amount: Number(e.value),
            property: e.property
        }));

        const normalizedMaint = maintenance.map(m => ({
            id: `maint-${m.id}`,
            description: `Manutenção: ${m.title}`,
            category: 'MAINTENANCE',
            date: m.scheduledDate,
            amount: Number(m.cost),
            property: m.property
        }));

        // 3. Payable Invoices (INSTALLMENT or EXPENSE)
        const payableInvoices = await this.prisma.invoice.findMany({
            where: {
                type: { in: ['INSTALLMENT', 'EXPENSE'] } // Fixed: PAYABLE -> INSTALLMENT/EXPENSE
            },
            include: {
                lease: { include: { property: { select: { address: true, nickname: true } } } },
                property: { select: { address: true, nickname: true } }
            }
        });

        const normalizedInvoices = payableInvoices.map(i => {
            // Safe property access
            const prop = i.lease?.property || i.property || null;
            return {
                id: `inv-${i.id}`,
                description: `Conta: ${i.description}`,
                category: i.type === 'INSTALLMENT' ? 'FINANCING' : 'EXPENSE',
                date: i.dueDate,
                amount: Number(i.amount),
                property: prop
            };
        });

        // 4. Merge & Sort
        return [...normalizedFixed, ...normalizedMaint, ...normalizedInvoices].sort((a, b) => b.date.getTime() - a.date.getTime());
    }
}
