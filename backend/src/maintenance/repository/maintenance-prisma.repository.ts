import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
    CreateMaintenanceRecordData,
    MaintenanceWithProperty,
    UpdateMaintenanceRecordData,
} from './maintenance-prisma.interface';

@Injectable()
export class MaintenancePrismaRepository {
    constructor(private prisma: PrismaService) { }

    // converts numeric input into prisma decimal
    private toDecimal(value: number | string) {
        return new Prisma.Decimal(value);
    }

    // converts string or date input into date
    private toDate(value: Date | string) {
        return value instanceof Date ? value : new Date(value);
    }

    // handles creating one maintenance item
    create(data: CreateMaintenanceRecordData) {
        return this.prisma.maintenance.create({
            data: {
                title: data.title,
                description: data.description,
                scheduledDate: this.toDate(data.scheduledDate),
                status: data.status,
                cost: data.cost !== undefined ? this.toDecimal(data.cost) : undefined,
                propertyId: data.propertyId,
            },
        });
    }

    // handles finding all maintenance items with property relation
    findAll(): Promise<MaintenanceWithProperty[]> {
        return this.prisma.maintenance.findMany({
            include: { property: true },
        });
    }

    // handles finding one maintenance item by id with property relation
    findById(id: string): Promise<MaintenanceWithProperty | null> {
        return this.prisma.maintenance.findUnique({
            where: { id },
            include: { property: true },
        });
    }

    // handles updating one maintenance item by id
    updateById(id: string, data: UpdateMaintenanceRecordData) {
        const updateData: Prisma.MaintenanceUncheckedUpdateInput = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.scheduledDate !== undefined) updateData.scheduledDate = this.toDate(data.scheduledDate);
        if (data.status !== undefined) updateData.status = data.status;
        if (data.cost !== undefined) {
            updateData.cost = data.cost === null ? null : this.toDecimal(data.cost);
        }
        if (data.propertyId !== undefined) updateData.propertyId = data.propertyId;

        return this.prisma.maintenance.update({
            where: { id },
            data: updateData,
        });
    }

    // handles completing maintenance and optionally creating expense invoice
    async complete(id: string, createInvoice: boolean) {
        return this.prisma.$transaction(async (temporaryOperationPrisma) => {
            const maintenance = await temporaryOperationPrisma.maintenance.update({
                where: { id },
                data: { status: 'COMPLETED' },
                include: { property: true }
            });

            if (createInvoice && maintenance.cost && Number(maintenance.cost) > 0) {
                await temporaryOperationPrisma.invoice.create({
                    data: {
                        type: 'EXPENSE',
                        description: `Manutenção: ${maintenance.title}`,
                        amount: maintenance.cost,
                        dueDate: new Date(),
                        status: 'PENDING',
                        propertyId: maintenance.propertyId,
                        approvalStatus: 'PENDING'
                    }
                });
            }

            return maintenance;
        });
    }

    // handles removing one maintenance item by id
    removeById(id: string) {
        return this.prisma.maintenance.delete({
            where: { id },
        });
    }
}