import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';
import { SiteConfigService } from './site-config.service';

@Controller('site-config')
export class SiteConfigController {
    constructor(private readonly siteConfigService: SiteConfigService) {}

    // handles returning the public site config
    @Get('public')
    getPublicConfig() {
        return this.siteConfigService.getPublicConfig();
    }

    // handles returning the admin site config
    @UseGuards(AuthGuard('jwt'))
    @Get('admin')
    getAdminConfig() {
        return this.siteConfigService.getConfig();
    }

    // handles updating the site config
    @UseGuards(AuthGuard('jwt'))
    @Patch()
    updateConfig(@Body() updateDto: UpdateSiteConfigDto) {
        return this.siteConfigService.updateConfig(updateDto);
    }
}