import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  // Enable body parser for local modules (like Products)
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe for DTOs
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // Security
  app.use(helmet());
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Request Logging Middleware
  app.use((req: any, res: any, next: any) => {
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
    logger: console,
    on: {
      proxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] Auth: ${req.method} ${(req as any).originalUrl || req.url}`);
      },
      error: (err, req, res) => {
        console.error(`[Proxy] Error: ${err.message}`);
        const response = res as any;
        if (!response.headersSent) {
          response.writeHead(502, { 'Content-Type': 'text/plain' });
          response.end('Bad Gateway: Unable to connect to upstream service.');
        }
      }
    }
  }));

  // Admin routes  
  app.use('/admin', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001',
    changeOrigin: true,
    pathRewrite: { '^/': '/admin/' }, // Prepend /admin back after middleware strips it
    logger: console,
  }));

  // Customer routes
  app.use('/customers', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001',
    changeOrigin: true,
    logger: console,
  }));

  // Device routes
  app.use('/devices', createProxyMiddleware({
    target: process.env.DEVICE_SERVICE_URL || 'http://127.0.0.1:3002',
    changeOrigin: true,
    logger: console,
  }));

  // Loan routes
  app.use('/loans', createProxyMiddleware({
    target: process.env.LOAN_SERVICE_URL || 'http://127.0.0.1:3003',
    changeOrigin: true,
    logger: console,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[Gateway] Running on port ${port}`);
}
bootstrap();
