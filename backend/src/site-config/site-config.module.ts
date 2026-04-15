import { Module } from '@nestjs/common';
import { SiteConfigController } from './site-config.controller';
import { SiteConfigService } from './site-config.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [SiteConfigController],
    providers: [SiteConfigService, PrismaService],
    exports: [SiteConfigService]
})
export class SiteConfigModule { }
