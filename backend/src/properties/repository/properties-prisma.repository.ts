import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
    CreateExpenseRecordData,
    CreatePropertyDocumentRecordData,
    CreatePropertyExpenseRecordData,
    CreatePropertyNoteRecordData,
    CreatePropertyRecordData,
    PropertyWithDetails,
    UpdatePropertyRecordData,
} from './properties-prisma.interface';

@Injectable()
export class PropertiesRepository {
    constructor(private prisma: PrismaService) { }

    // converts numeric input into prisma decimal
    private toDecimal(value: number | string) {
        return new Prisma.Decimal(value);
    }

    // converts string or date input into date
    private toDate(value: Date | string) {
        return value instanceof Date ? value : new Date(value);
    }

    // handles mapping property create payload to prisma input
    private buildPropertyCreateData(data: CreatePropertyRecordData): Prisma.PropertyUncheckedCreateInput {
        const createData = {
            code: data.code,
            address: data.address,
            type: data.type,
            nickname: data.nickname,
            description: data.description,
            installmentsCount: data.installmentsCount,
            installmentsPaid: data.installmentsPaid,
            isFinanced: data.isFinanced,
            photos: data.photos || [],
        } as Prisma.PropertyUncheckedCreateInput;

        if (data.purchasePrice !== undefined && data.purchasePrice !== null) createData.purchasePrice = this.toDecimal(data.purchasePrice);
        if (data.installmentValue !== undefined && data.installmentValue !== null) createData.installmentValue = this.toDecimal(data.installmentValue);
        if (data.financingTotalValue !== undefined && data.financingTotalValue !== null) createData.financingTotalValue = this.toDecimal(data.financingTotalValue);
        if (data.financingEndDate !== undefined && data.financingEndDate !== null) createData.financingEndDate = this.toDate(data.financingEndDate);

        return createData;
    }

    // handles mapping property update payload to prisma input
    private buildPropertyUpdateData(data: UpdatePropertyRecordData): Prisma.PropertyUncheckedUpdateInput {
        const updateData = {} as Prisma.PropertyUncheckedUpdateInput;

        if (data.code !== undefined) updateData.code = data.code;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.nickname !== undefined) updateData.nickname = data.nickname;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.installmentsCount !== undefined) updateData.installmentsCount = data.installmentsCount;
        if (data.installmentsPaid !== undefined) updateData.installmentsPaid = data.installmentsPaid;
        if (data.isFinanced !== undefined) updateData.isFinanced = data.isFinanced;
        if (data.photos !== undefined) updateData.photos = data.photos;
        if (data.deletedAt !== undefined) updateData.deletedAt = data.deletedAt;

        if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice === null ? null : this.toDecimal(data.purchasePrice);
        if (data.installmentValue !== undefined) updateData.installmentValue = data.installmentValue === null ? null : this.toDecimal(data.installmentValue);
        if (data.financingTotalValue !== undefined) updateData.financingTotalValue = data.financingTotalValue === null ? null : this.toDecimal(data.financingTotalValue);
        if (data.financingEndDate !== undefined) updateData.financingEndDate = data.financingEndDate === null ? null : this.toDate(data.financingEndDate);

        return updateData;
    }

    // handles mapping expense create payload to prisma input
    private buildExpenseCreateData(propertyId: string, data: CreateExpenseRecordData): Prisma.ExpenseUncheckedCreateInput {
        const createData = {
            propertyId,
            description: data.description,
            amount: this.toDecimal(data.amount),
            date: this.toDate(data.date),
            type: data.type as any,
            status: data.status as any,
        } as Prisma.ExpenseUncheckedCreateInput;

        return createData;
    }

    // handles mapping fixed property expense create payload to prisma input
    private buildPropertyExpenseCreateData(propertyId: string,data: CreatePropertyExpenseRecordData) {
        const createData = {
            propertyId,
            name: data.name,
            value: this.toDecimal(data.value),
            frequency: data.frequency as any,
            dueDay: data.dueDay,
        };

        return createData;
    }

    // handles creating one property
    create(data: CreatePropertyRecordData) {
        return this.prisma.property.create({
            data: this.buildPropertyCreateData(data),
        });
    }

    // handles finding all properties
    findAll() {
        return this.prisma.property.findMany({});
    }

    // handles finding one property by id with full details
    findById(id: string): Promise<PropertyWithDetails | null> {
        return this.prisma.property.findUnique({
            where: { id },
            include: {
                leases: {
                    include: {
                        tenant: true,
                        invoices: true
                    }
                },
                documents: true,
                maintenances: true,
                expenses: true,
                propertyExpenses: true,
                notes: true,
                invoices: true,
            },
        }) as Promise<PropertyWithDetails | null>;
    }

    // handles pushing new photos to property
    addPhotos(id: string, newPhotos: string[]) {
        return this.prisma.property.update({
            where: { id },
            data: {
                photos: {
                    push: newPhotos
                }
            }
        });
    }

    // handles creating one property document
    addDocument(data: CreatePropertyDocumentRecordData) {
        return this.prisma.propertyDocument.create({
            data: {
                title: data.title,
                filePath: data.filePath,
                fileType: data.fileType,
                propertyId: data.propertyId
            }
        });
    }

    // handles updating one property by id
    updateById(id: string, data: UpdatePropertyRecordData) {
        return this.prisma.property.update({
            where: { id },
            data: this.buildPropertyUpdateData(data),
        });
    }

    // handles creating one expense linked to a property
    addExpense(propertyId: string, data: CreateExpenseRecordData) {
        return this.prisma.expense.create({
            data: this.buildExpenseCreateData(propertyId, data)
        });
    }

    // handles creating one fixed property expense
    addPropertyExpense(propertyId: string, data: CreatePropertyExpenseRecordData) {
        return this.prisma.propertyExpense.create({
            data: this.buildPropertyExpenseCreateData(propertyId, data)
        });
    }

    // handles removing one fixed property expense
    removePropertyExpense(id: string) {
        return this.prisma.propertyExpense.delete({
            where: { id }
        });
    }

    // handles creating one property note
    addNote(data: CreatePropertyNoteRecordData) {
        return this.prisma.propertyNote.create({
            data: {
                content: data.content,
                propertyId: data.propertyId,
                userId: data.userId
            }
        });
    }

    // handles soft deleting one property by id
    removeById(id: string) {
        return this.prisma.property.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}