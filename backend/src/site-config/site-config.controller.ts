import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('site-config')
export class SiteConfigController {
    constructor(private readonly configService: SiteConfigService) { }

    @Get('public')
    getPublicConfig() {
        return this.configService.getPublicConfig();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('admin')
    getAdminConfig() {
        return this.configService.getConfig();
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch()
    updateConfig(@Body() updateDto: UpdateSiteConfigDto) {
        return this.configService.updateConfig(updateDto);
    }
}
