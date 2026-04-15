import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('maintenance')
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) { }

    @Post()
    create(@Body() createMaintenanceDto: CreateMaintenanceDto) {
        return this.maintenanceService.create(createMaintenanceDto);
    }

    @Get()
    findAll() {
        return this.maintenanceService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.maintenanceService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMaintenanceDto: any) {
        return this.maintenanceService.update(id, updateMaintenanceDto);
    }

    @Patch(':id/complete')
    complete(@Param('id') id: string, @Body() body: { createInvoice: boolean }) {
        return this.maintenanceService.complete(id, body.createInvoice);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.maintenanceService.remove(id);
    }
}
