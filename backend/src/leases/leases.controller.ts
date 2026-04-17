import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { AuthGuard } from '@nestjs/passport';
/**
 * Leases controller. This controller handles all leases endpoints.
 * This layer works only as front door to keep controller thin. 
 * all service is passed down to service layer
 * Endpoints: 
 *  - create
 *  - findAll
 *  - findOne
 *  - Apply adjustment
 */
@UseGuards(AuthGuard('jwt'))
@Controller('leases')
export class LeasesController {
    constructor(private readonly leasesService: LeasesService) { }

    @Post()
    create(@Body() createLeaseDto: CreateLeaseDto) {
        return this.leasesService.create(createLeaseDto);
    }

    @Get()
    findAll() {
        return this.leasesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.leasesService.findOne(id);
    }
    @Post(':id/adjust')
    applyAdjustment(@Param('id') id: string, @Body() body: { rate?: number, indexName?: string, date?: string }) {
        return this.leasesService.applyAdjustment(id, body);
    }
}
