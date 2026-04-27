import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PrismaService } from '../prisma.service';
import { PropertiesRepository } from './repository/properties-prisma.repository';

@Module({
    controllers: [PropertiesController],
    providers: [PropertiesService, PrismaService, PropertiesRepository],
})
export class PropertiesModule { }
