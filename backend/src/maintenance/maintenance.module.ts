import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { PrismaService } from '../prisma.service';
import { MaintenancePrismaRepository } from './repository/maintenance-prisma.repository';

@Module({
    controllers: [MaintenanceController],
    providers: [MaintenanceService, PrismaService, MaintenancePrismaRepository],
})
export class MaintenanceModule { }
