import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { EconomicIndicesService } from './economic-indices.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('economic-indices')
export class EconomicIndicesController {
    constructor(private readonly indicesService: EconomicIndicesService) { }

    @Get()
    getIndices(@Query('name') name?: string) {
        return this.indicesService.getIndices(name);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    addIndex(@Body() body: { name: string, date: string, value: number }) {
        return this.indicesService.addIndexRate(body.name, new Date(body.date), body.value);
    }
}
