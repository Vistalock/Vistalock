import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async create(createProductDto: CreateProductDto, merchantId: string): Promise<Product> {
        try {
            console.log('Creating product with data:', { ...createProductDto, merchantId });

            // Use raw SQL to bypass TypeORM mapping issues
            // Explicitly format numbers as strings to avoid driver type deduction issues
            const retailPrice = Number(createProductDto.retailPrice).toFixed(2);
            const downPayment = createProductDto.downPayment ? Number(createProductDto.downPayment).toFixed(2) : null;
            const stockQuantity = createProductDto.stockQuantity ? Number(createProductDto.stockQuantity) : null;

            const result = await this.productsRepository.query(`
                INSERT INTO products (
                    merchant_id, name, brand, model, os_type, retail_price,
                    bnpl_eligible, max_tenure_months, down_payment, lock_support, status, stock_quantity
                ) VALUES (
                    $1, $2, $3, $4, $5, $6::numeric, $7, $8, $9::numeric, $10, $11, $12
                ) RETURNING *
            `, [
                merchantId,
                createProductDto.name,
                createProductDto.brand,
                createProductDto.model,
                createProductDto.osType,
                retailPrice, // $6 - passed as string "500000.00"
                createProductDto.bnplEligible ?? true,
                createProductDto.maxTenureMonths ?? 6,
                downPayment, // $9
                createProductDto.lockSupport ?? true,
                createProductDto.status || 'active',
                stockQuantity
            ]);

            console.log('✅ Product created successfully:', result[0]);
            return result[0] as Product;
        } catch (err) {
            console.error('❌ CRITICAL ERROR IN CREATE:', err);
            throw err;
        }
    }

    async findAll(merchantId: string): Promise<Product[]> {
        return this.productsRepository.find({
            where: { merchantId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, merchantId: string): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id, merchantId } as any,
        }) as Product | null;

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto, merchantId: string): Promise<Product> {
        const product = await this.findOne(id, merchantId);
        Object.assign(product, updateProductDto);
        return this.productsRepository.save(product);
    }

    async remove(id: string, merchantId: string): Promise<void> {
        const product = await this.findOne(id, merchantId);
        product.status = 'inactive';
        await this.productsRepository.save(product);
    }

    // For agent mobile app - only active, BNPL-eligible products
    async findAgentAvailable(merchantId: string, branchId?: string): Promise<Product[]> {
        const query = this.productsRepository
            .createQueryBuilder('product')
            .where('product.merchantId = :merchantId', { merchantId })
            .andWhere('product.status = :status', { status: 'active' })
            .andWhere('product.bnplEligible = :bnplEligible', { bnplEligible: true })
            .andWhere('product.lockSupport = :lockSupport', { lockSupport: true });

        // Filter by branch if provided
        if (branchId) {
            query.andWhere('(product.branchId = :branchId OR product.branchId IS NULL)', { branchId });
        }

        // Filter out of stock items if inventory tracking is enabled
        query.andWhere('(product.stockQuantity IS NULL OR product.stockQuantity > 0)');

        return query.orderBy('product.name', 'ASC').getMany();
    }
}
