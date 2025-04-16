import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for all origins
  app.enableCors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  // Use validation pipe globally
  app.useGlobalPipes(new ValidationPipe());
  
  // API prefix
  app.setGlobalPrefix('api');
  
  await app.listen(5000, '0.0.0.0');
  console.log(`Application is running on: http://localhost:5000/api`);
}

bootstrap();