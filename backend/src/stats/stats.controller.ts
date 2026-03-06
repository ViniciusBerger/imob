import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { FinancialReportsService } from './financial-reports.service'; // Added
import { AuthGuard } from '@nestjs/passport';

@Controller('stats')
export class StatsController {
    constructor(
        private readonly statsService: StatsService,
        private readonly reportsService: FinancialReportsService // Added
    ) { }

    @Get('dashboard')
    @UseGuards(AuthGuard('jwt'))
    getDashboardStats() {
        return this.statsService.getDashboardStats();
    }

    @Get('reports/dre')
    @UseGuards(AuthGuard('jwt'))
    getDRE(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();
        return this.reportsService.getDRE(start, end);
    }

    @Get('reports/projection')
    @UseGuards(AuthGuard('jwt'))
    getCashFlowProjection() {
        return this.reportsService.getCashFlowProjection();
    }
}
