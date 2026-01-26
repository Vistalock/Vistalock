import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomerModule } from './customer/customer.module';
import { AdminConfigModule } from './admin-config/admin-config.module';
import { AdminMerchantModule } from './admin-merchant/admin-merchant.module';
import { AdminAuditModule } from './admin-audit/admin-audit.module';
import { MerchantApplicationModule } from './merchant/merchant-application.module';
import { ProductsModule } from './products/products.module';
import { LoansModule } from './loans/loans.module';
import { DeviceControlModule } from './device-control/device-control.module';
import { DevicesModule } from './devices/devices.module';
import { StorageModule } from './storage/storage.module';
import { AgentsModule } from './agents/agents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CreditModule } from './credit/credit.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    StorageModule,
    NotificationsModule,
    AgentsModule,
    AuthModule,
    UsersModule,
    CustomerModule,
    MerchantApplicationModule,
    AdminConfigModule,
    AdminMerchantModule,
    AdminAuditModule,
    ProductsModule,
    LoansModule,
    DeviceControlModule,
    DevicesModule,
    CreditModule,
    PaymentsModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }

