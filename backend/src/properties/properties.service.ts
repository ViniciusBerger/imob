import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertiesRepository } from './repository/properties-prisma.repository';
import {
    CreateExpenseRecordData,
    CreatePropertyExpenseRecordData,
    CreatePropertyRecordData,
    UpdatePropertyRecordData,
} from './repository/properties-prisma.interface';

@Injectable()
export class PropertiesService {
    constructor(private propertiesRepo: PropertiesRepository) { }

    // handles creating one property
    create(createPropertyDto: CreatePropertyDto) {
        const input: CreatePropertyRecordData = {
            ...createPropertyDto,
            photos: createPropertyDto.photos || [],
        };

        return this.propertiesRepo.create(input);
    }

    // handles finding all properties
    findAll() {
        return this.propertiesRepo.findAll();
    }

    // handles finding one property by id
    findOne(id: string) {
        return this.propertiesRepo.findById(id);
    }

    // handles adding photos to one property
    addPhotos(id: string, newPhotos: string[]) {
        return this.propertiesRepo.addPhotos(id, newPhotos);
    }

    // handles creating one property document
    addDocument(propertyId: string, title: string, filePath: string, fileType: string) {
        return this.propertiesRepo.addDocument({
            title,
            filePath,
            fileType,
            propertyId
        });
    }

    // handles updating one property by id
    update(id: string, data: UpdatePropertyRecordData) {
        return this.propertiesRepo.updateById(id, data);
    }

    // handles creating one property expense ledger entry
    addExpense(id: string, data: CreateExpenseRecordData) {
        return this.propertiesRepo.addExpense(id, data);
    }

    // handles creating one fixed property expense
    addPropertyExpense(propertyId: string, data: CreatePropertyExpenseRecordData) {
        return this.propertiesRepo.addPropertyExpense(propertyId, data);
    }

    // handles removing one fixed property expense
    removePropertyExpense(id: string) {
        return this.propertiesRepo.removePropertyExpense(id);
    }

    // handles creating one property note
    addNote(id: string, userId: string, content: string) {
        return this.propertiesRepo.addNote({
            content,
            propertyId: id,
            userId
        });
    }

    // handles soft deleting one property
    remove(id: string) {
        return this.propertiesRepo.removeById(id);
    }
}