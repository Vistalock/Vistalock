import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  // Enable body parser for local modules (like Products)
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe for DTOs
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // Security
  // Security
  app.use(helmet());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://vistalock-web-dashboard.vercel.app',
      'https://vistalock-loan-partner-portal.vercel.app'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Request Logging Middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[Gateway] Incoming Request: ${req.method} ${req.url} `);
    next();
  });

  // Proxy Routes - using wildcard to preserve full paths
  console.log('Configuring Gateway Proxies via main.ts...');

  // Auth routes
  app.use('/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001',
    changeOrigin: true,
    pathRewrite: { '^/': '/auth/' }, // Prepend /auth back after middleware strips it
  }));

  // Admin routes  
  app.use('/admin', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001',
    changeOrigin: true,
    pathRewrite: { '^/': '/admin/' }, // Prepend /admin back after middleware strips it
  }));

  // Customer routes
  app.use('/customers', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001',
    changeOrigin: true,
  }));

  // Device routes
  app.use('/devices', createProxyMiddleware({
    target: process.env.DEVICE_SERVICE_URL || 'http://127.0.0.1:3002',
    changeOrigin: true,
  }));

  // Loan routes
  app.use('/loans', createProxyMiddleware({
    target: process.env.LOAN_SERVICE_URL || 'http://127.0.0.1:3003',
    changeOrigin: true,
  }));

  // Loan Partner routes
  app.use('/loan-partner-api', createProxyMiddleware({
    target: process.env.LOAN_SERVICE_URL || 'http://127.0.0.1:3003',
    changeOrigin: true,
    pathRewrite: { '^/loan-partner-api': '/partner' },
  }));

  // Agent routes (Phase 8)
  app.use('/agents', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001',
    changeOrigin: true,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[Gateway] Running on port ${port}`);
}

bootstrap().catch(err => {
  console.error('Failed to start API Gateway:', err);
  process.exit(1);
});
