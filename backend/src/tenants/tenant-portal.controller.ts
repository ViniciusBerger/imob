import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantPortalService } from './tenant-portal.service';

type AuthenticatedRequest = {
    user: {
        email: string;
    };
};

@Controller('portal')
@UseGuards(AuthGuard('jwt'))
export class TenantPortalController {
    constructor(private readonly portalService: TenantPortalService) {}

    @Get('dashboard')
    getDashboard(@Req() req: AuthenticatedRequest) {
        const userEmail = req.user.email;
        return this.portalService.getDashboardData(userEmail);
    }
}