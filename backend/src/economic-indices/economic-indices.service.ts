import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EconomicIndicesService {
    constructor(private prisma: PrismaService) { }

    async addIndexRate(name: string, date: Date, value: number) {
        // Upsert to ensure we don't duplicate for the same month/index
        return this.prisma.economicIndex.upsert({
            where: {
                name_date: {
                    name,
                    date
                }
            },
            update: { value },
            create: {
                name,
                date,
                value
            }
        });
    }

    async getIndices(name?: string) {
        return this.prisma.economicIndex.findMany({
            where: name ? { name } : {},
            orderBy: { date: 'desc' },
            take: 24 // Last 2 years
        });
    }

    // Calculate accumulated rate for a period
    async getAccumulatedRate(indexName: string, startDate: Date, endDate: Date): Promise<number> {
        const rates = await this.prisma.economicIndex.findMany({
            where: {
                name: indexName,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        // Simple geometric accumulation: (1 + rate) * (1 + rate) ... - 1
        // Assuming backend stores rate as percentage (e.g. 0.5 for 0.5%)
        // If stored as 0.5, we convert to 0.005

        let accumulated = 1;
        for (const rate of rates) {
            // Prisma Decimal to number
            const val = Number(rate.value);
            accumulated *= (1 + (val / 100));
        }

        return (accumulated - 1) * 100; // Return as percentage
    }
}
