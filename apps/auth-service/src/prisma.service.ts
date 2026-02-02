
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
// @ts-ignore
import { PrismaClient } from '@vistalock/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: ['warn', 'error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                },
            },
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Connected to Database');
        } catch (error) {
            this.logger.error('❌ Failed to connect to Database', error);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('🛑 Disconnected from Database');
    }
}
