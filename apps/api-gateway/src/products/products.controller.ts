import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request as ExpressRequest } from 'express';

interface AuthRequest extends ExpressRequest {
    user: {
        sub: string;
        email: string;
        role: string;
    };
}

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@Body() createProductDto: CreateProductDto, @Request() req: AuthRequest) {
        console.log('⬇️ Received Create Payload:', JSON.stringify(createProductDto, null, 2));
        // TODO: Get merchantId from JWT token
        const merchantId = req.user?.sub || '00000000-0000-0000-0000-000000000001';
        return this.productsService.create(createProductDto, merchantId);
    }

    @Get()
    findAll(@Request() req: AuthRequest) {
        const merchantId = req.user?.sub || '00000000-0000-0000-0000-000000000001';
        return this.productsService.findAll(merchantId);
    }

    @Get('agent-available')
    findAgentAvailable(@Request() req: AuthRequest, @Query('branchId') branchId?: string) {
        const merchantId = req.user?.sub || '00000000-0000-0000-0000-000000000001';
        return this.productsService.findAgentAvailable(merchantId, branchId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: AuthRequest) {
        const merchantId = req.user?.sub || '00000000-0000-0000-0000-000000000001';
        return this.productsService.findOne(id, merchantId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req: AuthRequest) {
        const merchantId = req.user?.sub || '00000000-0000-0000-0000-000000000001';
        return this.productsService.update(id, updateProductDto, merchantId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: AuthRequest) {
        const merchantId = req.user?.sub || '00000000-0000-0000-0000-000000000001';
        return this.productsService.remove(id, merchantId);
    }
}
