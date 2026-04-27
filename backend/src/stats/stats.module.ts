import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { PrismaService } from '../prisma.service';
import { FinancialReportsService } from './financial-reports.service';
import { StatsPrismaRepository } from './repository/stats-prisma.repository';

@Module({
    controllers: [StatsController],
    providers: [
    StatsService,
    StatsPrismaRepository,
    FinancialReportsService,
    PrismaService,
    ]
})
export class StatsModule { }
