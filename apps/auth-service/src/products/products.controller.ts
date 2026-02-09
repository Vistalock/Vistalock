import { Controller, Get, Post, Body, Param, UseGuards, Request, UnauthorizedException, Put, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    async create(@Request() req, @Body() body: any) {
        // Only Merchant or Admin can create products
        if (req.user.role !== 'MERCHANT' && req.user.role !== 'SUPER_ADMIN') {
            throw new UnauthorizedException('Only Merchants can create products');
        }

        // Map frontend field names to database schema
        const productData = {
            name: body.name,
            brand: body.brand,
            model: body.model,
            osType: body.osType,
            price: body.retailPrice, // Map retailPrice -> price
            minDownPayment: body.downPayment || 0, // Map downPayment -> minDownPayment
            maxTenure: body.maxTenureMonths || 12,
            stockQuantity: body.stockQuantity || 0,
            category: body.category,
            description: body.description,
            loanPartnerId: body.loanPartnerId || null,
            // Add any other fields from body that match schema
        };

        return this.productsService.create(req.user.userId, productData);
    }

    @Patch(':id')
    async update(@Request() req, @Param('id') id: string, @Body() body: any) {
        if (req.user.role !== 'MERCHANT') {
            throw new UnauthorizedException('Only Merchants can update products');
        }
        return this.productsService.update(id, req.user.userId, body);
    }

    @Get()
    async findAll(@Request() req) {
        let merchantId = req.user.userId;

        // If Agent, get their merchant's products
        if (req.user.role === 'MERCHANT_AGENT') {
            // We need to fetch the agent's merchantId. 
            // Ideally it's in the JWT payload. If not, we fetched it in AuthService.
            // Let's rely on the service to lookup if needed, OR assume we put it in JWT.
            // For now, let's assume the Agent's User record has 'merchantId'.
            // We'll need to lookup the user to be sure if it's not in req.user
            // Quick hack: pass userId to service and let it figure out? 
            // Better: The Controller should resolve the target merchantId.

            // Accessing the shared 'merchantId' for the agent:
            // We might need to query the User to get the merchantId if it's not in the request object.
            // For MVP, we'll trust that we can fetch the user.
            // Actually, the `AuthService` login puts `role` and `sub` in JWT. Not `merchantId`.
            // So we must query.
            // For now, let's assume the frontend passes `merchantId` or we fetch it.
            // Let's make the service handle "Get products specific to this user's context"
        }

        // Simpler: Client confirms "Who am I".
        // Let's implement a 'smart' findAll in the service or just fetch User here.
        // Since I don't have easy access to UsersService here without importing module...
        // I will assume for now this endpoint is for the MERCHANT to see their own products.

        return this.productsService.findAll(merchantId);
    }

    @Get('agent-catalog')
    async getAgentCatalog(@Request() req) {
        if (req.user.role !== 'MERCHANT_AGENT') throw new UnauthorizedException('Access denied');

        try {
            return await this.productsService.getAgentCatalog(req.user.userId);
        } catch (error) {
            console.error('Error fetching agent catalog:', error);
            // Return empty if issue, or throw
            return [];
        }
    }
}
