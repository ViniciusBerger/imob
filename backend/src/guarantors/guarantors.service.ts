import { ConflictException, Injectable } from '@nestjs/common';
import { CreateGuarantorDto } from './dto/create-guarantor.dto';
import {
    CreateGuarantorRecordData,
    UpdateGuarantorRecordData,
} from './repository/guarantors-repository.interface';
import { GuarantorsRepository } from './repository/guarantors-prisma.repository';

@Injectable()
export class GuarantorsService {
    constructor(private readonly guarantorsRepository: GuarantorsRepository) {}

    // handles creating one guarantor
    async create(data: CreateGuarantorDto) {
        const guarantorData = this.buildGuarantorCreateData(data);

        try {
            return await this.guarantorsRepository.create(guarantorData);
        } catch (error: unknown) {
            this.handleGuarantorUniqueError(error);
        }
    }

    // handles finding all guarantors
    findAll() {
        return this.guarantorsRepository.findAll();
    }

    // handles finding one guarantor by id
    findOne(id: string) {
        return this.guarantorsRepository.findById(id);
    }

    // handles updating one guarantor
    async update(id: string, data: UpdateGuarantorRecordData) {
        const guarantorData = this.buildGuarantorUpdateData(data);

        try {
            return await this.guarantorsRepository.updateById(id, guarantorData);
        } catch (error: unknown) {
            this.handleGuarantorUniqueError(error);
        }
    }

    // handles removing one guarantor
    remove(id: string) {
        return this.guarantorsRepository.deleteById(id);
    }

    // handles mapping guarantor create payload to repository input
    private buildGuarantorCreateData(
        data: CreateGuarantorDto,
    ): CreateGuarantorRecordData {
        return {
            name: data.name,
            document: data.document,
            email: data.email || null,
            phone: data.phone || null,
        };
    }

    // handles mapping guarantor update payload to repository input
    private buildGuarantorUpdateData(
        data: UpdateGuarantorRecordData,
    ): UpdateGuarantorRecordData {
        return {
            name: data.name,
            document: data.document,
            email: data.email || null,
            phone: data.phone || null,
        };
    }

    // handles translating repository unique errors into http exceptions
    private handleGuarantorUniqueError(error: unknown): never {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'P2002'
        ) {
            throw new ConflictException(
                'Já existe um fiador com este Documento (CPF).',
            );
        }

        throw error;
    }
}