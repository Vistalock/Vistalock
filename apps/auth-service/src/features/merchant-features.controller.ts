import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeaturesService } from './features.service';
import {
    SubscribeToFeatureDto,
    FeatureSubscriptionQueryDto,
    CreateFeatureRequestDto,
    FeatureRequestQueryDto
} from './dto';

@Controller('merchant/features')
@UseGuards(AuthGuard('jwt'))
export class MerchantFeaturesController {
    constructor(private featuresService: FeaturesService) { }

    // ==================== FEATURE CATALOG ====================

    /**
     * Get feature catalog
     */
    @Get('catalog')
    async getCatalog() {
        return this.featuresService.findAllActive();
    }

    // ==================== SUBSCRIPTIONS ====================

    /**
     * Get my feature subscriptions
     */
    @Get('subscriptions')
    async getMySubscriptions(@Request() req, @Query() query: FeatureSubscriptionQueryDto) {
        this.ensureMerchant(req.user);
        return this.featuresService.getSubscriptions(req.user.userId, query);
    }

    /**
     * Subscribe to a feature
     */
    @Post('subscribe')
    async subscribe(@Request() req, @Body() dto: SubscribeToFeatureDto) {
        this.ensureMerchant(req.user);
        return this.featuresService.subscribe(req.user.userId, dto);
    }

    /**
     * Cancel a subscription
     */
    @Delete('subscriptions/:id')
    async cancelSubscription(@Request() req, @Param('id') id: string) {
        this.ensureMerchant(req.user);
        return this.featuresService.cancelSubscription(req.user.userId, id);
    }

    // ==================== FEATURE REQUESTS ====================

    /**
     * Get my feature requests
     */
    @Get('requests')
    async getMyRequests(@Request() req, @Query() query: FeatureRequestQueryDto) {
        this.ensureMerchant(req.user);
        return this.featuresService.getRequests(req.user.userId, query);
    }

    /**
     * Create a feature request
     */
    @Post('request')
    async createRequest(@Request() req, @Body() dto: CreateFeatureRequestDto) {
        this.ensureMerchant(req.user);
        return this.featuresService.createRequest(req.user.userId, dto);
    }

    private ensureMerchant(user: any) {
        if (user.role !== 'MERCHANT') {
            throw new UnauthorizedException('Only merchants can access features');
        }
    }
}
