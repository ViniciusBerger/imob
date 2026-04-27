import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from './stats.service';
import { FinancialReportsService } from './financial-reports.service';

// interface to objectify dre query params
interface IDREQuery {
    startDate?: string;
    endDate?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('stats')
export class StatsController {
    constructor(
        private readonly statsService: StatsService,
        private readonly reportsService: FinancialReportsService
    ) { }

    @Get('dashboard')
    // handles dashboard stats endpoint
    getDashboardStats() {
        return this.statsService.getDashboardStats();
    }

    @Get('reports/dre')
    // handles dre report endpoint
    getDRE(@Query() query: IDREQuery) {
        const start = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = query.endDate ? new Date(query.endDate) : new Date();

        return this.reportsService.getDRE(start, end);
    }

    @Get('reports/projection')
    // handles cash flow projection endpoint
    getCashFlowProjection() {
        return this.reportsService.getCashFlowProjection();
    }
}