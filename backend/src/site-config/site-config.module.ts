import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SiteConfigController } from './site-config.controller';
import { SiteConfigService } from './site-config.service';
import { SiteConfigRepository } from './repository/site-config-prisma.repository';

@Module({
    controllers: [SiteConfigController],
    providers: [
        SiteConfigService,
        SiteConfigRepository,
        PrismaService,
    ],
    exports: [SiteConfigService],
})
export class SiteConfigModule {}