import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFiles, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';

@Controller('properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createPropertyDto: CreatePropertyDto) {
        return this.propertiesService.create(createPropertyDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/photos')
    @UseInterceptors(FilesInterceptor('files', 10, {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    uploadPhotos(@Param('id') id: string, @UploadedFiles() files: Array<Express.Multer.File>) {
        const filePaths = files.map(file => `/uploads/${file.filename}`);
        return this.propertiesService.addPhotos(id, filePaths);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/documents')
    @UseInterceptors(FilesInterceptor('file', 1, {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    uploadDocument(@Param('id') id: string, @Body('title') title: string, @UploadedFiles() files: Array<Express.Multer.File>) {
        if (!files || files.length === 0) return { error: 'No file uploaded' };
        const file = files[0];
        // Note: storing full path /uploads/filename
        return this.propertiesService.addDocument(id, title || file.originalname, `/uploads/${file.filename}`, file.mimetype);
    }

    @Get()
    findAll() {
        return this.propertiesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.propertiesService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/expenses')
    addExpense(@Param('id') id: string, @Body() body: any) {
        return this.propertiesService.addExpense(id, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/property-expenses')
    addPropertyExpense(@Param('id') id: string, @Body() body: any) {
        return this.propertiesService.addPropertyExpense(id, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('property-expenses/:id')
    removePropertyExpense(@Param('id') id: string) {
        return this.propertiesService.removePropertyExpense(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/notes')
    addNote(@Param('id') id: string, @Body() body: { content: string, userId: string }, @Req() req:any) {
        return this.propertiesService.addNote(id, req.user.id, body.content);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePropertyDto: any) {
        return this.propertiesService.update(id, updatePropertyDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.propertiesService.remove(id);
    }
}
