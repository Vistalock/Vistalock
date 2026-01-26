import axios, { AxiosInstance } from 'axios';

export interface VistalockConfig {
    apiKey: string;
    baseUrl?: string;
}

export class VistaLockClient {
    private client: AxiosInstance;

    constructor(config: VistalockConfig) {
        this.client = axios.create({
            baseURL: config.baseUrl || 'http://localhost:3000',
            headers: {
                'x-api-key': config.apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    async createLoan(data: { userId: string, deviceId: string, amount: number, durationMonths: number, interestRate: number }) {
        const response = await this.client.post('/loans', data);
        return response.data;
    }

    async getLoan(id: string) {
        const response = await this.client.get(`/loans/${id}`);
        return response.data;
    }

    async repayLoan(id: string, amount: number) {
        const response = await this.client.post(`/loans/${id}/repay`, { amount });
        return response.data;
    }

    async registerDevice(data: { imei: string, model: string, merchantId: string }) {
        // merchantId is usually inferred from API Key in a real system, 
        // but here we might pass it explicitly or backend infers it.
        // For now pass it, assuming backend will eventually validate it matches key owner.
        const response = await this.client.post('/devices', data);
        return response.data;
    }
}
