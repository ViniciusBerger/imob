import { Module } from '@nestjs/common';
import { EconomicIndicesService } from './economic-indices.service';
import { EconomicIndicesController } from './economic-indices.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [EconomicIndicesController],
    providers: [EconomicIndicesService, PrismaService],
    exports: [EconomicIndicesService],
})
export class EconomicIndicesModule { }
