import { Injectable } from '@nestjs/common';
import { EconomicIndicesRepository } from './repository/economic-indices-prisma.repository';

@Injectable()
export class EconomicIndicesService {
    constructor(
        private readonly economicIndicesRepository: EconomicIndicesRepository,
    ) {}

    // handles adding or updating one economic index monthly rate
    addIndexRate(name: string, date: Date, value: number) {
        return this.economicIndicesRepository.upsertRate({
            name,
            date,
            value,
        });
    }

    // handles finding recent economic index rates
    getIndices(name?: string) {
        return this.economicIndicesRepository.findRecent(name);
    }

    // handles calculating accumulated rate for one period
    async getAccumulatedRate(
        indexName: string,
        startDate: Date,
        endDate: Date,
    ): Promise<number> {
        const rates = await this.economicIndicesRepository.findRatesInRange(
            indexName,
            startDate,
            endDate,
        );

        let accumulated = 1;

        for (const rate of rates) {
            accumulated *= 1 + rate.value / 100;
        }

        return (accumulated - 1) * 100;
    }
}