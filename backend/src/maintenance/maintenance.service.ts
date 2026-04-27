import { Injectable } from '@nestjs/common';
import { MaintenancePrismaRepository } from './repository/maintenance-prisma.repository';
import {
    CreateMaintenanceRecordData,
    UpdateMaintenanceRecordData,
} from './repository/maintenance-prisma.interface';

@Injectable()
export class MaintenanceService {
    constructor(private maintenanceRepo: MaintenancePrismaRepository) { }

    // handles creating one maintenance item
    create(input: CreateMaintenanceRecordData) {
        return this.maintenanceRepo.create(input);
    }

    // handles finding all maintenance items
    findAll() {
        return this.maintenanceRepo.findAll();
    }

    // handles finding one maintenance item by id
    findOne(id: string) {
        return this.maintenanceRepo.findById(id);
    }

    // handles updating one maintenance item by id
    update(id: string, data: UpdateMaintenanceRecordData) {
        return this.maintenanceRepo.updateById(id, data);
    }

    // handles completing maintenance and optionally creating expense invoice
    complete(id: string, createInvoice: boolean) {
        return this.maintenanceRepo.complete(id, createInvoice);
    }

    // handles removing one maintenance item by id
    remove(id: string) {
        return this.maintenanceRepo.removeById(id);
    }
}