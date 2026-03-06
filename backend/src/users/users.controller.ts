import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() body: any) {
        return this.usersService.create(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Request() req: any) {
        return req.user;
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.usersService.update(id, body);
    }
}
