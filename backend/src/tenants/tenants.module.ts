import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UsersModule } from '../users/users.module';
import { TenantPortalController } from './tenant-portal.controller';
import { TenantPortalService } from './tenant-portal.service';
import { TenantsRepository } from './repository/tenants-prisma.repository';
import { TenantsController } from './tenants.controller';
import { TenantPortalRepository } from './repository/tenant-portal-prisma.repository';
import { TenantsService } from './tenants.service';

@Module({
    imports: [UsersModule],
    controllers: [TenantsController, TenantPortalController],
    providers: [
        PrismaService,
        TenantsService,
        TenantPortalService,
        TenantsRepository,
        TenantPortalRepository
    ],
    exports: [TenantsService],
})
export class TenantsModule {}