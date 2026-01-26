import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5433'),
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'secret123',
      database: process.env.DB_NAME || 'vistalock_local',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Use manual migrations instead
    }),
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
