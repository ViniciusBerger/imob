import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertiesService {
    constructor(private prisma: PrismaService) { }

    create(createPropertyDto: CreatePropertyDto) {
        // Prisma will ignore undefined fields, but we should make sure photos is an array
        const { photos, ...rest } = createPropertyDto;
        return this.prisma.property.create({
            data: {
                ...rest,
                photos: photos || [],
            },
        });
    }

    findAll() {
        return this.prisma.property.findMany({});
    }

    findOne(id: string) {
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
        });
    }

    addPhotos(id: string, newPhotos: string[]) {
        return this.prisma.property.update({
            where: { id },
            data: {
                photos: {
                    push: newPhotos
                }
            }
        })
    }

    // New method for PropertyDocument
    async addDocument(propertyId: string, title: string, filePath: string, fileType: string) {
        return this.prisma.propertyDocument.create({
            data: {
                title,
                filePath,
                fileType,
                propertyId
            }
        })
    }

    // Financing/Financial updates are handled via general update
    update(id: string, updatePropertyDto: any) {
        return this.prisma.property.update({
            where: { id },
            data: updatePropertyDto,
        });
    }

    addExpense(id: string, data: any) {
        return this.prisma.expense.create({
            data: {
                ...data,
                propertyId: id
            }
        })
    }

    // Property Expense (Fixed Costs Definition)
    async addPropertyExpense(propertyId: string, data: any) {
        return this.prisma.propertyExpense.create({
            data: {
                ...data,
                propertyId
            }
        });
    }

    async removePropertyExpense(id: string) {
        return this.prisma.propertyExpense.delete({
            where: { id }
        });
    }

    addNote(id: string, userId: string, content: string) {
        return this.prisma.propertyNote.create({
            data: {
                content,
                propertyId: id,
                userId
            }
        })
    }

    remove(id: string) {
        return this.prisma.property.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
