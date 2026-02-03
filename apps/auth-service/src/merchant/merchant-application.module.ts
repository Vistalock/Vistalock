
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MerchantApplicationService } from './merchant-application.service';
import { MerchantApplicationController } from './merchant-application.controller';
import { EmailModule } from '../email/email.module';
import { CreditServiceAdapter } from '../integration/credit-service.adapter';
import { RateLimiterMiddleware } from '../common/middleware/rate-limiter.middleware';

@Module({
    imports: [EmailModule],
    providers: [MerchantApplicationService, CreditServiceAdapter],
    controllers: [MerchantApplicationController],
})
export class MerchantApplicationModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RateLimiterMiddleware)
            .forRoutes({ path: 'auth/merchant/apply', method: RequestMethod.POST });
    }
}
