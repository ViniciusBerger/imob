import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import {
    CreateMaintenanceRecordData,
    UpdateMaintenanceRecordData,
} from './repository/maintenance-prisma.interface';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('maintenance')
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) { }

    @Post()
    create(@Body() createMaintenanceDto: CreateMaintenanceDto) {
        const input: CreateMaintenanceRecordData = {
            title: createMaintenanceDto.title,
            description: createMaintenanceDto.description,
            scheduledDate: createMaintenanceDto.scheduledDate,
            status: createMaintenanceDto.status,
            cost: createMaintenanceDto.cost,
            propertyId: createMaintenanceDto.propertyId,
        };

        return this.maintenanceService.create(input);
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
        const data: UpdateMaintenanceRecordData = {
            title: updateMaintenanceDto.title,
            description: updateMaintenanceDto.description,
            scheduledDate: updateMaintenanceDto.scheduledDate,
            status: updateMaintenanceDto.status,
            cost: updateMaintenanceDto.cost,
            propertyId: updateMaintenanceDto.propertyId,
        };

        return this.maintenanceService.update(id, data);
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