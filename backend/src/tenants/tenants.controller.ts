import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() createTenantDto: CreateTenantDto) {
        return this.tenantsService.create(createTenantDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    findAll() {
        return this.tenantsService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    findOne(@Param('id') id: string) {
        return this.tenantsService.findOne(id);
    }

    @Patch(':id') // Changed from Put to Patch for partial updates convention, though logic replaces fields provided
    @UseGuards(AuthGuard('jwt'))
    update(@Param('id') id: string, @Body() updateTenantDto: any) {
        return this.tenantsService.update(id, updateTenantDto);
    }

    @Post(':id/user')
    @UseGuards(AuthGuard('jwt'))
    createUser(@Param('id') id: string) {
        return this.tenantsService.createUser(id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    remove(@Param('id') id: string) {
        return this.tenantsService.remove(id);
    }
}
