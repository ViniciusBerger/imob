import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { PrismaService } from '../prisma.service';
import { UsersModule } from '../users/users.module';

import { TenantPortalService } from './tenant-portal.service';
import { TenantPortalController } from './tenant-portal.controller';

@Module({
    imports: [UsersModule],
    controllers: [TenantsController, TenantPortalController],
    providers: [TenantsService, PrismaService, TenantPortalService],
})
export class TenantsModule { }
