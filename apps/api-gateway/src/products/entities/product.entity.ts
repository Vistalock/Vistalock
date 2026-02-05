import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'merchant_id' })
    merchantId: string;

    @Column()
    name: string;

    @Column()
    brand: string;

    @Column()
    model: string;

    @Column({ name: 'os_type' })
    osType: 'Android' | 'iOS';

    @Column('decimal', { precision: 10, scale: 2, name: 'retail_price' })
    retailPrice: number;

    @Column({ name: 'bnpl_eligible', default: true })
    bnplEligible: boolean;

    @Column({ name: 'max_tenure_months', default: 6 })
    maxTenureMonths: number;

    @Column('decimal', { precision: 10, scale: 2, name: 'down_payment', nullable: true })
    downPayment: number;

    @Column({ name: 'lock_support', default: true })
    lockSupport: boolean;

    @Column({ default: 'active' })
    status: 'active' | 'inactive';

    @Column({ name: 'branch_id', nullable: true })
    branchId: string;

    @Column({ name: 'stock_quantity', type: 'int', nullable: true })
    stockQuantity: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
