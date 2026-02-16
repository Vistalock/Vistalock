import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());

  // Serve static files from uploads directory
  const uploadsPath = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap().catch(err => {
  console.error('Failed to start Auth Service:', err);
  process.exit(1);
});
