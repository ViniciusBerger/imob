import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertiesService } from './properties.service';
import {
    CreateExpenseRecordData,
    CreatePropertyExpenseRecordData,
    UpdatePropertyRecordData,
} from './repository/properties-prisma.interface';

type AuthenticatedRequest = Request & {
    user: {
        id: string;
    };
};


@Controller('properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) { }


    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() createPropertyDto: CreatePropertyDto) {
        return this.propertiesService.create(createPropertyDto);
    }

    @Patch(':id/photos')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');

                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    uploadPhotos(@Param('id') id: string, @UploadedFiles() files: Array<Express.Multer.File>) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }

        const filePaths = files.map((file) => `/uploads/${file.filename}`);
        return this.propertiesService.addPhotos(id, filePaths);
    }

    @Post(':id/documents')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(
        FilesInterceptor('file', 1, {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');

                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    uploadDocument(
        @Param('id') id: string,
        @Body('title') title: string,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No file uploaded');
        }

        const file = files[0];

        return this.propertiesService.addDocument(
            id,
            title || file.originalname,
            `/uploads/${file.filename}`,
            file.mimetype,
        );
    }

    @Get()
    findAll() {
        return this.propertiesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.propertiesService.findOne(id);
    }

    @Post(':id/expenses')
    @UseGuards(AuthGuard('jwt'))
    addExpense(@Param('id') id: string, @Body() body: CreateExpenseRecordData) {
        return this.propertiesService.addExpense(id, body);
    }

    @Post(':id/property-expenses')
    @UseGuards(AuthGuard('jwt'))
    addPropertyExpense(@Param('id') id: string, @Body() body: CreatePropertyExpenseRecordData) {
        return this.propertiesService.addPropertyExpense(id, body);
    }

    @Delete('property-expenses/:id')
    @UseGuards(AuthGuard('jwt'))
    removePropertyExpense(@Param('id') id: string) {
        return this.propertiesService.removePropertyExpense(id);
    }

    @Post(':id/notes')
    @UseGuards(AuthGuard('jwt'))
    addNote(
        @Param('id') id: string,
        @Body() body: { content: string },
        @Req() req: AuthenticatedRequest,
    ) {
        return this.propertiesService.addNote(id, req.user.id, body.content);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyRecordData) {
        return this.propertiesService.update(id, updatePropertyDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    remove(@Param('id') id: string) {
        return this.propertiesService.remove(id);
    }
}