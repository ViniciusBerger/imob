import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GuarantorsController } from './guarantors.controller';
import { GuarantorsService } from './guarantors.service';
import { GuarantorsRepository } from './repository/guarantors-prisma.repository';

@Module({
    controllers: [GuarantorsController],
    providers: [PrismaService, GuarantorsService, GuarantorsRepository],
    exports: [GuarantorsService],
})
export class GuarantorsModule {}