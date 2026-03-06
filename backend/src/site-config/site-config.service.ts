import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';

@Injectable()
export class SiteConfigService {
    constructor(private prisma: PrismaService) { }

    async getConfig() {
        const config = await this.prisma.siteConfig.findFirst();
        if (!config) {
            // Create default
            return this.prisma.siteConfig.create({
                data: {
                    appName: 'eSolu - Imóveis',
                    primaryColor: 'blue',
                    layoutType: 'MODERN_GRID',
                    showPrices: true
                }
            });
        }
        return config;
    }

    async updateConfig(updateDto: UpdateSiteConfigDto) {
        const config = await this.getConfig();
        return this.prisma.siteConfig.update({
            where: { id: config.id },
            data: updateDto
        });
    }

    // Public method doesn't need auth, but implementation is same for now
    async getPublicConfig() {
        return this.getConfig();
    }
}
