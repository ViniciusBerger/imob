import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { softDeleteMiddleware, filterSoftDeletedMiddleware } from './common/middleware/soft-delete.middleware';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
        // Apply Soft Delete Middleware
        this.$use(softDeleteMiddleware());
        this.$use(filterSoftDeletedMiddleware());
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
