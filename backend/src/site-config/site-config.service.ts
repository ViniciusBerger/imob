import { Injectable } from '@nestjs/common';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';
import {
    CreateSiteConfigRecordData,
    UpdateSiteConfigRecordData,
} from './repository/site-config-repository.interface';
import { SiteConfigRepository } from './repository/site-config-prisma.repository';

@Injectable()
export class SiteConfigService {
    constructor(private readonly siteConfigRepository: SiteConfigRepository) {}

    // handles finding the current site config or creating the default one
    async getConfig() {
        const config = await this.siteConfigRepository.findFirst();

        if (config) {
            return config;
        }

        const defaultConfig: CreateSiteConfigRecordData = {
            appName: 'eSolu - Imóveis',
            primaryColor: 'blue',
            layoutType: 'MODERN_GRID',
            showPrices: true,
        };

        return this.siteConfigRepository.create(defaultConfig);
    }

    // handles updating the current site config
    async updateConfig(updateDto: UpdateSiteConfigDto) {
        const config = await this.getConfig();

        const updateData: UpdateSiteConfigRecordData = {
            appName: updateDto.appName,
            primaryColor: updateDto.primaryColor,
            layoutType: updateDto.layoutType,
            showPrices: updateDto.showPrices,
        };

        return this.siteConfigRepository.updateById(config.id, updateData);
    }

    // handles finding the public site config
    async getPublicConfig() {
        return this.getConfig();
    }
}