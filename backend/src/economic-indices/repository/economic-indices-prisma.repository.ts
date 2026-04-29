import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
    EconomicIndexRecord,
    IEconomicIndicesRepository,
    UpsertEconomicIndexRateRecordData,
} from './economic-indices-repository.interface';

type PrismaEconomicIndexRecord = {
    id: string;
    name: string;
    date: Date;
    value: Prisma.Decimal | number;
};

@Injectable()
export class EconomicIndicesRepository implements IEconomicIndicesRepository {
    constructor(private readonly prisma: PrismaService) {}

    // handles upserting one economic index rate by name and date
    async upsertRate(
        data: UpsertEconomicIndexRateRecordData,
    ): Promise<EconomicIndexRecord> {
        const index = await this.prisma.economicIndex.upsert({
            where: {
                name_date: {
                    name: data.name,
                    date: new Date(data.date),
                },
            },
            update: {
                value: data.value,
            },
            create: {
                name: data.name,
                date: new Date(data.date),
                value: data.value,
            },
        });

        return this.toEconomicIndexRecord(index);
    }

    // handles finding recent economic index rates
    async findRecent(name?: string): Promise<EconomicIndexRecord[]> {
        const indices = await this.prisma.economicIndex.findMany({
            where: name ? { name } : {},
            orderBy: { date: 'desc' },
            take: 24,
        });

        return indices.map((index) => this.toEconomicIndexRecord(index));
    }

    // handles finding economic index rates inside one date range
    async findRatesInRange(
        name: string,
        startDate: Date,
        endDate: Date,
    ): Promise<EconomicIndexRecord[]> {
        const indices = await this.prisma.economicIndex.findMany({
            where: {
                name,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { date: 'asc' },
        });

        return indices.map((index) => this.toEconomicIndexRecord(index));
    }

    // handles mapping one prisma economic index record into app-level record
    private toEconomicIndexRecord(
        index: PrismaEconomicIndexRecord,
    ): EconomicIndexRecord {
        return {
            id: index.id,
            name: index.name,
            date: index.date,
            value: this.toNumber(index.value),
        };
    }

    // handles converting prisma decimal values into number
    private toNumber(value: Prisma.Decimal | number): number {
        if (typeof value === 'number') {
            return value;
        }

        return value.toNumber();
    }
}