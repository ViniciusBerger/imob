import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

async function bootstrap() {
    // setup global validation pipeline. whitelist will strip properties, and forbid will throw error for any non-expected property
    const VALIDATION_PIPE = new ValidationPipe({
        whitelist: true, 
        forbidNonWhitelisted: true, 
        transform: true, // auto-transform payloads to DTO instances
    })


    // Enable CORS for external communication from specific address. only this address can communicate with application
    const CORS_OPTIONS = {
        origin:process.env.FRONTEND_URL,
        methods: 'GET,PUT,PATCH,POST,DELETE,HEAD',
        credentials: false // add true for production VERY IMPORTANT
    }

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    
    
    const app = await NestFactory.create(AppModule);
    app.enableCors(CORS_OPTIONS); 
    app.useGlobalPipes(VALIDATION_PIPE); // Global validation pipeline
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT ?? 3000); // fallback to port 3000 
    
}
bootstrap();
