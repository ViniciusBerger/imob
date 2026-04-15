import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantPortalService } from './tenant-portal.service';

@Controller('portal')
export class TenantPortalController {
    constructor(private readonly portalService: TenantPortalService) { }

    @Get('dashboard')
    @UseGuards(AuthGuard('jwt'))
    async getDashboard(@Req() req) {
        const userEmail = req.user.email;
        return this.portalService.getDashboardData(userEmail);
    }
}
