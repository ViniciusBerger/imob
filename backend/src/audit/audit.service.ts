import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log(action: string, entity: string, entityId: string, changes: any, userId?: string) {
        await this.prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                changes: JSON.stringify(changes),
                userId
            }
        });
    }
}
