import { Module } from '@nestjs/common';
import { GuarantorsService } from './guarantors.service';
import { GuarantorsController } from './guarantors.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [GuarantorsController],
    providers: [GuarantorsService, PrismaService],
})
export class GuarantorsModule { }
