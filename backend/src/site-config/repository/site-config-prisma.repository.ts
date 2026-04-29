import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
    CreateSiteConfigRecordData,
    ISiteConfigRepository,
    SiteConfigRecord,
    UpdateSiteConfigRecordData,
} from './site-config-repository.interface';

@Injectable()
export class SiteConfigRepository implements ISiteConfigRepository {
    constructor(private readonly prisma: PrismaService) {}

    // handles finding the first site config record
    findFirst(): Promise<SiteConfigRecord | null> {
        return this.prisma.siteConfig.findFirst() as Promise<SiteConfigRecord | null>;
    }

    // handles creating one site config record
    create(data: CreateSiteConfigRecordData): Promise<SiteConfigRecord> {
        return this.prisma.siteConfig.create({
            data: {
                appName: data.appName,
                primaryColor: data.primaryColor,
                layoutType: data.layoutType,
                showPrices: data.showPrices,
            },
        }) as Promise<SiteConfigRecord>;
    }

    // handles updating one site config record by id
    updateById(id: string, data: UpdateSiteConfigRecordData): Promise<SiteConfigRecord> {
        return this.prisma.siteConfig.update({
            where: { id },
            data: {
                appName: data.appName,
                primaryColor: data.primaryColor,
                layoutType: data.layoutType,
                showPrices: data.showPrices,
            },
        }) as Promise<SiteConfigRecord>;
    }
}