import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { PrismaService } from '../prisma.service';
import { FinancialReportsService } from './financial-reports.service';

@Module({
    controllers: [StatsController],
    providers: [StatsService, PrismaService, FinancialReportsService],
})
export class StatsModule { }
