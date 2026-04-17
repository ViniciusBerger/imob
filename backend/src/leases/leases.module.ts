import { Module } from '@nestjs/common';
import { LeasesService } from './leases.service';
import { LeasesController } from './leases.controller';
import { PrismaService } from '../prisma.service';
import { EconomicIndicesModule } from '../economic-indices/economic-indices.module';
import { LeasesRepository } from './leases.repository';
import { LEASES_REPOSITORY } from './leases.repository.interface';

@Module({
  imports: [EconomicIndicesModule],
  controllers: [LeasesController],
  providers: [
    LeasesService,
    PrismaService,
    LeasesRepository,
    {
      provide: LEASES_REPOSITORY,
      useClass: LeasesRepository,
    },
  ],
})
export class LeasesModule {}