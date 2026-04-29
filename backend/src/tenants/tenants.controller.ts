import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsService } from './tenants.service';

@Controller('tenants')
@UseGuards(AuthGuard('jwt'))
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) {}

    @Post()
    create(@Body() createTenantDto: CreateTenantDto) {
        return this.tenantsService.create(createTenantDto);
    }

    @Get()
    findAll() {
        return this.tenantsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tenantsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
        return this.tenantsService.update(id, updateTenantDto);
    }

    @Post(':id/user')
    createUser(@Param('id') id: string) {
        return this.tenantsService.createUser(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tenantsService.remove(id);
    }
}