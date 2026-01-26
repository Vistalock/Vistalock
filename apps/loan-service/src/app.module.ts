import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoanModule } from './loan/loan.module';
import { AppScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [
    PrometheusModule.register(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    LoanModule,
    AppScheduleModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }

