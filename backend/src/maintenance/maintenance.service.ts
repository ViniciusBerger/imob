import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

@Injectable()
export class MaintenanceService {
    constructor(private prisma: PrismaService) { }

    create(createMaintenanceDto: CreateMaintenanceDto) {
        return this.prisma.maintenance.create({
            data: createMaintenanceDto,
        });
    }

    findAll() {
        return this.prisma.maintenance.findMany({
            include: { property: true },
        });
    }

    findOne(id: string) {
        return this.prisma.maintenance.findUnique({
            where: { id },
            include: { property: true },
        });
    }

    async update(id: string, updateMaintenanceDto: any) {
        return this.prisma.maintenance.update({
            where: { id },
            data: updateMaintenanceDto,
        });
    }

    async complete(id: string, createInvoice: boolean) {
        const maintenance = await this.prisma.maintenance.update({
            where: { id },
            data: { status: 'COMPLETED' },
            include: { property: true }
        });

        if (createInvoice && maintenance.cost && Number(maintenance.cost) > 0) {
            // Create Expense Invoice
            await this.prisma.invoice.create({
                data: {
                    type: 'EXPENSE',
                    description: `Manutenção: ${maintenance.title}`,
                    amount: maintenance.cost,
                    dueDate: new Date(), // Due today?
                    status: 'PENDING',
                    propertyId: maintenance.propertyId,
                    approvalStatus: 'PENDING'
                }
            });
        }

        return maintenance;
    }

    remove(id: string) {
        return this.prisma.maintenance.delete({
            where: { id },
        });
    }
}
