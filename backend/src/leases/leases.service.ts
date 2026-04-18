import { BadRequestException, Injectable } from '@nestjs/common';
import { EconomicIndicesService } from '../economic-indices/economic-indices.service';
import { LeaseWithRelations, UpdateLeaseRecordData } from './repository/leases-prisma.interface';
import { NotFoundException } from '@nestjs/common';
import { LeaseContract } from '@prisma/client';
import { LeasesRepository } from './repository/leases-prisma.repository';

// interface to objectify applyAdjustment data. 
interface IAdjustmentData {
    rate?: number, 
    indexName?: string, 
    date?: string
}

@Injectable()
export class LeasesService {

    constructor( private leaseRepo: LeasesRepository, private indicesService: EconomicIndicesService) {}

    async applyAdjustment(id: string, data: IAdjustmentData): Promise<LeaseContract> {
        const lease = await this.leaseRepo.findById(id)
        if (!lease) throw new NotFoundException('Contrato nao encontrado')
        // delegate calculating to specific helper
        const rate = await this.calculateRate(data, lease)

        const oldRent = Number(lease.rentValue);
        const newRent = oldRent * (1 + (rate / 100)); // new rent is equal to oldRent + 10%

        // return updated lease
        return await this.leaseRepo.updateAdjustmentById(id,{
            rentValue: newRent,
            lastAdjustmentDate: new Date(),
            adjustmentRate: rate,
            notes: (lease.notes || '') + `\n[${new Date().toISOString()}] Reajuste aplicado: ${rate.toFixed(2)}% (${data.indexName || 'Manual'}). Aluguel: ${oldRent} -> ${newRent.toFixed(2)}`
            });
    }

    // used to calculate accumulated rate at leasesService.applyAdjustment
    private async calculateRate(data: IAdjustmentData, lease: LeaseWithRelations) {
        let rate = data.rate;
        // If not rate, but an index name exist. calculate from index history
        if (!rate && data.indexName) {
            const endDate = data.date ? new Date(data.date) : new Date(); // if no endDate use today.
            const startDate = lease.lastAdjustmentDate || lease.startDate; // if lease never adjusted use startDate 
            
            rate = await this.indicesService.getAccumulatedRate(data.indexName, startDate, endDate);
        }

        // handles null and undefined.
        if (rate == null) throw new BadRequestException('Taxa de reajuste não pôde ser calculada. Forneça uma taxa manual ou verifique os índices.');
        return rate
    }


    async create(input: ICreateLeaseInput) {
        const leaseData = {
            type: input.type,
            startDate: input.startDate,
            endDate: input.endDate,
            rentValue: input.rentValue,
            rentDueDay: input.rentDueDay,
            adjustmentRate: input.adjustmentRate,
            adjustmentIndex: input.adjustmentIndex,
            autoRenew: input.autoRenew,
            notes: input.notes,
            propertyId: input.propertyId,
            tenantId: input.tenantId,
            guarantorId: input.guarantorId,
            };

        const invoiceDrafts = this.buildInitialRentInvoiceDrafts(input);

        return this.leaseRepo.createWithInitialInvoices(leaseData, invoiceDrafts);
    }

    // parse incoming lease dates as business dates (date-only), not UTC timestamps
    private parseBusinessDate(value: Date | string) {
        if (value instanceof Date) return new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());

        const [year, month, day] = value.split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    // handles building initial invoice draft when lease is created.
    private buildInitialRentInvoiceDrafts(input: ICreateLeaseInput) {
        const invoices = [];
        const startDate = this.parseBusinessDate(input.startDate);
        const endDate = this.parseBusinessDate(input.endDate);
        const dueDay = input.rentDueDay || 5; // if due day not specified fallback to the 5th

        // Always start at the 1st of the month
        let iteratorDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

        while (iteratorDate < endDate) {
            const targetMonth = iteratorDate.getMonth();
            const targetYear = iteratorDate.getFullYear();

            // built invoice due date for target month
            let tempDueDate = new Date(targetYear, targetMonth, dueDay);

            //if due date is before the lease started push to the same day on next month
            if (tempDueDate < startDate) tempDueDate = new Date(targetYear, targetMonth + 1, dueDay);
            
            // stop if due date goes after lease end date. but only after at least 1 inovice was created
            if (tempDueDate > endDate && invoices.length > 0) break;

            // add to invoices aray
            invoices.push({
            type: 'RENT' as const,
            description: `Aluguel ${targetMonth + 1}/${targetYear}`,
            amount: input.rentValue,
            dueDate: tempDueDate,
            status: 'PENDING' as const,
            propertyId: input.propertyId,
            });
            
            // Move to next month and repeat (I + 1)
            iteratorDate.setMonth(iteratorDate.getMonth() + 1);
        }

        return invoices;
    }

    async findAll() {
        const leases = await this.leaseRepo.findAll();
        const now = new Date();
        
        for (const lease of leases) await this.checkExpiration(lease, now);
        return leases;
        }

    async findOne(id: string) {
        const lease = await this.leaseRepo.findById(id);
        if (lease) await this.checkExpiration(lease, new Date());
        return lease;
        }

    private async checkExpiration(lease: LeaseWithRelations, now: Date) {
        if (!lease.isActive || new Date(lease.endDate) >= now) return;
        
        if (lease.autoRenew) {
            const newEndDate = new Date(lease.endDate);
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);

            const notes =
            (lease.notes || '') +
            `\n[System] Auto-renewed on ${now.toISOString()} until ${newEndDate.toISOString()}`;

            await this.leaseRepo.renewById(lease.id, newEndDate, notes);

            lease.endDate = newEndDate;
            lease.notes = notes;
            return;
        }

        // if not auto renew inactive the lease
        await this.leaseRepo.markInactive(lease.id);
        lease.isActive = false;
    }

    update(id: string, data: UpdateLeaseRecordData) {
        return this.leaseRepo.updateById(id, data);
    }
}