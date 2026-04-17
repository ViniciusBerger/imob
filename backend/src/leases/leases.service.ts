import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { EconomicIndicesService } from '../economic-indices/economic-indices.service';

// interface to object apply adjustment data. 
interface IAdjustmentData {
    rate?: number, 
    indexName?: string, 
    date?: string
}

@Injectable()
export class LeasesService {
    
    
    constructor(
        private prisma: PrismaService,
        private indicesService: EconomicIndicesService
    ) { }

    async applyAdjustment(id: string, data: IAdjustmentData) {
        const lease = await this.prisma.leaseContract.findUnique({ where: { id } });
        if (!lease) throw new Error('Contrato não encontrado');

        let rate = data.rate;

        // If rate not provided, calculate from index
        if (!rate && data.indexName && lease.lastAdjustmentDate) {
            // Calculate accumulation since last adjustment
            const endDate = data.date ? new Date(data.date) : new Date();
            // Start date = last adjustment OR lease start date + 1 year?
            // Usually adjustment is annual.
            // Let's assume start = lastAdjustmentDate
            // If lastAdjustmentDate is null, use startDate
            const startDate = lease.lastAdjustmentDate || lease.startDate;

            rate = await this.indicesService.getAccumulatedRate(data.indexName, startDate, endDate);
        }

        if (rate === undefined || rate === null) {
            throw new Error('Taxa de reajuste não pôde ser calculada. Forneça uma taxa manual ou verifique os índices.');
        }

        const oldRent = Number(lease.rentValue);
        const newRent = oldRent * (1 + (rate / 100));

        // Update Lease
        const updatedLease = await this.prisma.leaseContract.update({
            where: { id },
            data: {
                rentValue: newRent,
                lastAdjustmentDate: new Date(),
                adjustmentRate: rate,
                notes: (lease.notes || '') + `\n[${new Date().toISOString()}] Reajuste aplicado: ${rate.toFixed(2)}% (${data.indexName || 'Manual'}). Aluguel: ${oldRent} -> ${newRent.toFixed(2)}`
            }
        });

        return updatedLease;
    }

    async create(createLeaseDto: CreateLeaseDto) {
        const lease = await this.prisma.leaseContract.create({
            data: createLeaseDto,
        });

        // Generate Invoices for the duration
        const invoices = [];
        let currentDate = new Date(lease.startDate);
        const endDate = new Date(lease.endDate);
        const dueDay = lease.rentDueDay || 5;

        // Advance to first due date (next month or same month if day < dueDay?)
        // Simple logic: First Rent is due on the first occurrence of 'dueDay' after startDate.
        // If startDate is 2024-01-01 and dueDay is 5, first rent is 2024-01-05? Or 02-05?
        // Usually, rent is prepaid or postpaid. Let's assume postpaid (next month).
        // Actually user said "VENCIMENTO DOS ALUGUEIS".
        // Let's generate for each month.

        // Normalize currentDate to start of month to avoid overflow issues
        let iteratorDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        while (iteratorDate < endDate) {
            // Calculate due date for this month
            // We want the DueDay of this month or next?
            // Let's say we generate 1 invoice for each month the contract is active.

            let targetMonth = iteratorDate.getMonth();
            let targetYear = iteratorDate.getFullYear();

            // Check if we should generate for this month (if lease starts mid-month, maybe first due is next month?)
            // Let's stick to: One invoice per month. Due date = dueDay. 
            // If startDate > dueDay, maybe first invoice is next month.

            let tempDueDate = new Date(targetYear, targetMonth, dueDay);

            // If calculated due date is before start date, skip to next month (or it's pro-rata, but let's keep simple)
            if (tempDueDate < new Date(lease.startDate)) {
                tempDueDate = new Date(targetYear, targetMonth + 1, dueDay);
                // updating iterator is dangerous here if we don't align
            }

            // Safety break 
            if (tempDueDate > endDate && invoices.length > 0) break;

            invoices.push({
                type: 'RENT',
                description: `Aluguel ${targetMonth + 1}/${targetYear}`,
                amount: lease.rentValue,
                dueDate: tempDueDate,
                status: 'PENDING',
                leaseId: lease.id,
                propertyId: lease.propertyId,
            });

            // Move to next month
            iteratorDate.setMonth(iteratorDate.getMonth() + 1);
        }

        // Batch create invoices
        // We need to cast type to the Enum compatible string or use 'RENT' if it matches
        if (invoices.length > 0) {
            await this.prisma.invoice.createMany({
                data: invoices as any
            });
        }

        return lease;
    }

    async findAll() {
        const leases = await this.prisma.leaseContract.findMany({
            where: {
                property: {
                    deletedAt: null
                }
            },
            include: {
                property: true,
                tenant: true,
                guarantor: true,
            },
        });

        // Lazy update for expiration
        const now = new Date();
        for (const lease of leases) {
            await this.checkExpiration(lease, now);
        }

        return leases;
    }

    async findOne(id: string) {
        const lease = await this.prisma.leaseContract.findUnique({
            where: { id },
            include: {
                property: true,
                tenant: true,
                guarantor: true,
            },
        });

        if (lease) {
            await this.checkExpiration(lease, new Date());
        }

        return lease;
    }

    private async checkExpiration(lease: any, now: Date) {
        if (lease.isActive && new Date(lease.endDate) < now) {
            if (lease.autoRenew) {
                // Auto Renew: Add 1 year
                const newEndDate = new Date(lease.endDate);
                newEndDate.setFullYear(newEndDate.getFullYear() + 1);

                await this.prisma.leaseContract.update({
                    where: { id: lease.id },
                    data: {
                        endDate: newEndDate,
                        notes: (lease.notes || '') + `\n[System] Auto-renewed on ${now.toISOString()} until ${newEndDate.toISOString()}`
                    }
                });
                lease.endDate = newEndDate;
                // TODO: Generate new invoices for the renewed period
            } else {
                await this.prisma.leaseContract.update({
                    where: { id: lease.id },
                    data: { isActive: false }
                });
                lease.isActive = false;
            }
        }
    }

    update(id: string, body: any) {
        return this.prisma.leaseContract.update({
            where: { id },
            data: body,
        })
    }
}
