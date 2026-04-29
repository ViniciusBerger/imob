import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EconomicIndicesController } from './economic-indices.controller';
import { EconomicIndicesService } from './economic-indices.service';
import { EconomicIndicesRepository } from './repository/economic-indices-prisma.repository';

@Module({
    controllers: [EconomicIndicesController],
    providers: [
        EconomicIndicesService,
        EconomicIndicesRepository,
        PrismaService,
    ],
    exports: [EconomicIndicesService],
})
export class EconomicIndicesModule {}