import { Module } from '@nestjs/common';
import { LeasesService } from './leases.service';
import { LeasesController } from './leases.controller';
import { PrismaService } from '../prisma.service';
import { EconomicIndicesModule } from '../economic-indices/economic-indices.module';
import { LeasesRepository } from './repository/leases-prisma.repository';
import { LEASES_REPOSITORY } from './repository/leases-prisma.interface';

@Module({
  imports: [EconomicIndicesModule],
  controllers: [LeasesController],
  providers: [
    LeasesService,
    PrismaService,
    LeasesRepository,
  ],
})
export class LeasesModule {}