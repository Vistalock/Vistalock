/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios, { AxiosInstance } from 'axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    PaymentInitializeResponse,
    PaymentProvider,
    PaymentVerifyResponse,
    SubaccountResponse,
} from '../payment.interface';

@Injectable()
export class PaystackProvider implements PaymentProvider {
    private readonly client: AxiosInstance;
    private readonly logger = new Logger(PaystackProvider.name);

    constructor(private configService: ConfigService) {
        const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
        this.client = axios.create({
            baseURL: 'https://api.paystack.co',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
            },
        });
    }

    async initializePayment(
        amount: number,
        email: string,
        metadata: any,
        subaccount?: string,
    ): Promise<PaymentInitializeResponse> {
        try {
            const payload: any = {
                amount,
                email,
                metadata,
            };

            // Vistalock's "Platform Fee" Logic:
            // If a subaccount is provided, we want to give them 100% of the funds.
            // Paystack splits by defaut (taking their fee from the subaccount share if bearer=subaccount).
            // We set bearer='subaccount' to ensure the merchant pays the fees, or 'account' if Vistalock pays.
            // For now, simple split:
            if (subaccount) {
                payload.subaccount = subaccount;
                // payload.bearer = 'subaccount'; // Merchant pays Paystack fees
            }

            const { data } = await this.client.post('/transaction/initialize', payload);
            return {
                authorizationUrl: data.data.authorization_url,
                reference: data.data.reference,
                accessCode: data.data.access_code,
            };
        } catch (error) {
            this.handleError(error, 'initializePayment');
        }
    }

    async verifyTransaction(reference: string): Promise<PaymentVerifyResponse> {
        try {
            const { data } = await this.client.get(`/transaction/verify/${reference}`);
            const tx = data.data;

            return {
                status: tx.status.toUpperCase(), // 'success', 'failed', 'abandoned'
                amount: tx.amount,
                currency: tx.currency,
                reference: tx.reference,
                metadata: tx.metadata || {},
                paidAt: tx.paid_at ? new Date(tx.paid_at) : undefined,
            };
        } catch (error) {
            this.handleError(error, 'verifyTransaction');
        }
    }

    async createSubaccount(
        businessName: string,
        bankCode: string,
        accountNumber: string,
        percentageCharge = 0,
    ): Promise<SubaccountResponse> {
        try {
            const { data } = await this.client.post('/subaccount', {
                business_name: businessName,
                settlement_bank: bankCode,
                account_number: accountNumber,
                percentage_charge: percentageCharge, // Vistalock fee (0%)
                primary_contact_email: 'no-reply@vistalock.local',
                primary_contact_name: businessName,
            });

            return {
                subaccountCode: data.data.subaccount_code,
                businessName: data.data.business_name,
                settlementBank: data.data.settlement_bank,
                accountNumber: data.data.account_number,
            };
        } catch (error) {
            this.handleError(error, 'createSubaccount');
        }
    }

    private handleError(error: any, context: string): never {
        const msg = error.response?.data?.message || error.message;
        this.logger.error(`Paystack Error [${context}]: ${msg}`, error.stack);
        throw new InternalServerErrorException(`Payment Provider Error: ${msg}`);
    }
}
