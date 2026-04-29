import {BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserRecordData, UpdateUserRecordData } from './repository/users-repository.interface';
import { UsersRepository } from './repository/users-prisma.repository';

@Injectable()
export class UsersService implements OnModuleInit {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly usersRepository: UsersRepository) {}

    // handles optional default admin bootstrap on module startup
    async onModuleInit() {
        const shouldBootstrapAdmin =
            process.env.ENABLE_DEFAULT_ADMIN_BOOTSTRAP === 'true';

        if (!shouldBootstrapAdmin) {
            return;
        }

        const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
        const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

        // handles skipping bootstrap when required env values are missing
        if (!adminEmail || !adminPassword) {
            this.logger.warn(
                'Default admin bootstrap was enabled but DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD is missing.',
            );
            return;
        }

        const adminExists = await this.usersRepository.findByEmail(adminEmail);

        // handles preventing duplicate bootstrap admin creation
        if (adminExists) {
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await this.usersRepository.create({
            name: 'Administrador',
            email: adminEmail,
            password: hashedPassword,
            role: 'ADMIN',
        });

        this.logger.warn(`Default admin user bootstrapped for ${adminEmail}`);
    }

    // handles finding one user by email
    findOne(email: string) {
        return this.usersRepository.findByEmail(email);
    }

    // handles finding one user by id
    findById(id: string) {
        return this.usersRepository.findById(id);
    }

    // handles finding all users
    findAll() {
        return this.usersRepository.findAll();
    }

    // handles creating one user with hashed password
    async create(data: CreateUserRecordData) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        return this.usersRepository.create({
            ...data,
            password: hashedPassword,
        });
    }

    // handles updating one user and re-hashing password when provided
    async update(id: string, data: UpdateUserRecordData) {
        const updateData: UpdateUserRecordData = { ...data };

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        return this.usersRepository.updateById(id, updateData);
    }

    // handles saving one reset token and expiry for one user
    updateResetToken(email: string, token: string | null, expiry: Date | null) {
        return this.usersRepository.updateResetToken(email, token, expiry);
    }

    // handles finding one user by valid reset token
    findByResetToken(token: string) {
        return this.usersRepository.findValidByResetToken(token);
    }

    // handles resetting one user password from reset token flow
    async resetPasswordWithToken(token: string, newPass: string) {
        const user = await this.findByResetToken(token);

        if (!user) {
            throw new BadRequestException('Invalid or expired token');
        }

        const hashedPassword = await bcrypt.hash(newPass, 10);

        return this.usersRepository.updatePasswordAndClearResetToken(
            user.id,
            hashedPassword,
        );
    }
}