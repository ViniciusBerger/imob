import { Module } from '@nestjs/common';
import { LeasesService } from './leases.service';
import { LeasesController } from './leases.controller';
import { PrismaService } from '../prisma.service';

import { EconomicIndicesModule } from '../economic-indices/economic-indices.module';

@Module({
    imports: [EconomicIndicesModule],
    controllers: [LeasesController],
    providers: [LeasesService, PrismaService],
})
export class LeasesModule { }
