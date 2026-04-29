import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EconomicIndicesService } from './economic-indices.service';

@Controller('economic-indices')
export class EconomicIndicesController {
    constructor(
        private readonly economicIndicesService: EconomicIndicesService,
    ) {}

    // handles returning recent economic indices
    @Get()
    getIndices(@Query('name') name?: string) {
        return this.economicIndicesService.getIndices(name);
    }

    // handles adding or updating one economic index rate
    @UseGuards(AuthGuard('jwt'))
    @Post()
    addIndex(@Body() body: { name: string; date: string; value: number }) {
        return this.economicIndicesService.addIndexRate(
            body.name,
            new Date(body.date),
            body.value,
        );
    }
}