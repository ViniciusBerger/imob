import { BadRequestException, ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import {CreateTenantRecordData, UpdateTenantRecordData } from './repository/tenants-repository.interface';
import { TenantsRepository } from './repository/tenants-prisma.repository';

@Injectable()
export class TenantsService {
    constructor(
        private readonly tenantsRepository: TenantsRepository,
        private readonly usersService: UsersService,
    ) {}

    // handles creating one tenant
    async create(data: CreateTenantDto) {
        const tenantData = this.buildTenantCreateData(data);

        try {
            return await this.tenantsRepository.create(tenantData);
        } catch (error: unknown) {
            this.handleTenantUniqueError(error);
        }
    }

    // handles creating one tenant portal user
    async createUser(tenantId: string) {
        const tenant = await this.tenantsRepository.findTenantById(tenantId);

        if (!tenant) {
            throw new NotFoundException('Inquilino não encontrado.');
        }

        if (!tenant.email) {
            throw new BadRequestException('Inquilino não possui email cadastrado.');
        }

        const existingUser = await this.tenantsRepository.findUserByEmailOrTenantId(
            tenant.email,
            tenant.id,
        );

        if (existingUser) {
            throw new ConflictException('Usuário já existe para este inquilino/email.');
        }

        const tempPassword = this.generateTemporaryPassword();

        await this.usersService.create({
            name: tenant.name,
            email: tenant.email,
            password: tempPassword,
            role: 'TENANT',
            tenantId: tenant.id,
        });

        return {
            message: 'Usuário criado',
            email: tenant.email,
            tempPassword,
        };
    }

    // handles finding all tenants
    findAll() {
        return this.tenantsRepository.findAll();
    }

    // handles finding one tenant by id
    findOne(id: string) {
        return this.tenantsRepository.findById(id);
    }

    // handles updating one tenant
    async update(id: string, data: UpdateTenantRecordData) {
        const tenantData = this.buildTenantUpdateData(data);

        try {
            return await this.tenantsRepository.updateById(id, tenantData);
        } catch (error: unknown) {
            this.handleTenantUniqueError(error);
        }
    }

    // handles removing one tenant
    remove(id: string) {
        return this.tenantsRepository.deleteById(id);
    }

    // handles mapping tenant create payload to repository input
    private buildTenantCreateData(data: CreateTenantDto): CreateTenantRecordData {
        return {
            name: data.name,
            document: data.document,
            email: data.email || null,
            phone: data.phone || null,
            profession: data.profession || null,
        };
    }

    // handles mapping tenant update payload to repository input
    private buildTenantUpdateData(data: UpdateTenantRecordData): UpdateTenantRecordData {
        return {
            name: data.name,
            document: data.document,
            email: data.email || null,
            phone: data.phone || null,
            profession: data.profession || null,
        };
    }

    // handles generating one strong temporary password
    private generateTemporaryPassword() {
        return `Tmp#A1a${randomBytes(8).toString('hex')}`;
    }

    // handles translating repository unique errors into http exceptions
    private handleTenantUniqueError(error: unknown): never {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'P2002'
        ) {
            throw new ConflictException(
                'Já existe um inquilino com este Documento (CPF/CNPJ).',
            );
        }

        throw error;
    }
}