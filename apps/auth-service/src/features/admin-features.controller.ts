import {
    Controller,
    Get,
    Post,
    Patch,
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
    CreateFeatureDto,
    UpdateFeatureDto,
    UpdateFeatureRequestDto,
    FeatureRequestQueryDto
} from './dto';

@Controller('admin/features')
@UseGuards(AuthGuard('jwt'))
export class AdminFeaturesController {
    constructor(private featuresService: FeaturesService) { }

    // ==================== FEATURE CATALOG MANAGEMENT ====================

    /**
     * Get all features
     */
    @Get()
    async getAllFeatures(@Request() req) {
        this.ensureAdmin(req.user);
        return this.featuresService.findAll();
    }

    /**
     * Get a single feature
     */
    @Get(':id')
    async getFeature(@Request() req, @Param('id') id: string) {
        this.ensureAdmin(req.user);
        return this.featuresService.findOne(id);
    }

    /**
     * Create a feature
     */
    @Post()
    async createFeature(@Request() req, @Body() dto: CreateFeatureDto) {
        this.ensureAdmin(req.user);
        return this.featuresService.create(dto);
    }

    /**
     * Update a feature
     */
    @Patch(':id')
    async updateFeature(
        @Request() req,
        @Param('id') id: string,
        @Body() dto: UpdateFeatureDto
    ) {
        this.ensureAdmin(req.user);
        return this.featuresService.update(id, dto);
    }

    /**
     * Delete a feature
     */
    @Delete(':id')
    async deleteFeature(@Request() req, @Param('id') id: string) {
        this.ensureAdmin(req.user);
        return this.featuresService.delete(id);
    }

    // ==================== SUBSCRIPTION STATISTICS ====================

    /**
     * Get subscription statistics
     */
    @Get('subscriptions/stats')
    async getSubscriptionStats(@Request() req) {
        this.ensureAdmin(req.user);
        return this.featuresService.getSubscriptionStats();
    }

    // ==================== FEATURE REQUESTS MANAGEMENT ====================

    /**
     * Get all feature requests
     */
    @Get('requests/all')
    async getAllRequests(@Request() req, @Query() query: FeatureRequestQueryDto) {
        this.ensureAdmin(req.user);
        return this.featuresService.getAllRequests(query);
    }

    /**
     * Update a feature request
     */
    @Patch('requests/:id')
    async updateRequest(
        @Request() req,
        @Param('id') id: string,
        @Body() dto: UpdateFeatureRequestDto
    ) {
        this.ensureAdmin(req.user);
        return this.featuresService.updateRequest(id, dto);
    }

    private ensureAdmin(user: any) {
        if (user.role !== 'SUPER_ADMIN') {
            throw new UnauthorizedException('Admin access required');
        }
    }
}
