import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

async function bootstrap() {
    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const app = await NestFactory.create(AppModule);

    // Enable CORS for Frontend communication
    app.enableCors();

    // Enable Global Validation for DTOs
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // properties not in DTO are stripped
        forbidNonWhitelisted: true, // throw error if extra properties are sent
        transform: true, // auto-transform payloads to DTO instances
    }));

    app.setGlobalPrefix('api');
    await app.listen(3000);
}
bootstrap();
