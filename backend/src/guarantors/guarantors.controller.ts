import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete } from '@nestjs/common';
import { GuarantorsService } from './guarantors.service';
import { CreateGuarantorDto } from './dto/create-guarantor.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('guarantors')
export class GuarantorsController {
    constructor(private readonly guarantorsService: GuarantorsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() createGuarantorDto: CreateGuarantorDto) {
        return this.guarantorsService.create(createGuarantorDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    findAll() {
        return this.guarantorsService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    findOne(@Param('id') id: string) {
        return this.guarantorsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    update(@Param('id') id: string, @Body() updateGuarantorDto: any) {
        return this.guarantorsService.update(id, updateGuarantorDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    remove(@Param('id') id: string) {
        return this.guarantorsService.remove(id);
    }
}
