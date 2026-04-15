import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('leases')
export class LeasesController {
    constructor(private readonly leasesService: LeasesService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() createLeaseDto: CreateLeaseDto) {
        return this.leasesService.create(createLeaseDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    findAll() {
        return this.leasesService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    findOne(@Param('id') id: string) {
        return this.leasesService.findOne(id);
    }
    @Post(':id/adjust')
    @UseGuards(AuthGuard('jwt'))
    applyAdjustment(@Param('id') id: string, @Body() body: { rate?: number, indexName?: string, date?: string }) {
        return this.leasesService.applyAdjustment(id, body);
    }
}
