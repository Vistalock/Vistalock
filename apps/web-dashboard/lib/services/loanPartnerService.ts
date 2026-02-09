import apiClient from '../apiClient';

export interface LoanPartner {
    id: string;
    merchantId: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    apiKey: string;
    apiSecret?: string; // Only returned on creation/rotation
    webhookUrl?: string;
    webhookSecret?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLoanPartnerDto {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    webhookUrl?: string;
}

export interface UpdateLoanPartnerDto {
    name?: string;
    slug?: string;
    description?: string;
    logoUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    webhookUrl?: string;
    isActive?: boolean;
}

export const loanPartnerService = {
    /**
     * Get all loan partners
     */
    async getAll(): Promise<LoanPartner[]> {
        const response = await apiClient.get('/merchant/loan-partners');
        return response.data;
    },

    /**
     * Get a single loan partner
     */
    async getById(id: string): Promise<LoanPartner> {
        const response = await apiClient.get(`/merchant/loan-partners/${id}`);
        return response.data;
    },

    /**
     * Create a new loan partner
     */
    async create(data: CreateLoanPartnerDto): Promise<LoanPartner> {
        const response = await apiClient.post('/merchant/loan-partners', data);
        return response.data;
    },

    /**
     * Update a loan partner
     */
    async update(id: string, data: UpdateLoanPartnerDto): Promise<LoanPartner> {
        const response = await apiClient.patch(`/merchant/loan-partners/${id}`, data);
        return response.data;
    },

    /**
     * Delete a loan partner
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/merchant/loan-partners/${id}`);
    },

    /**
     * Rotate API credentials
     */
    async rotateCredentials(id: string): Promise<{ apiKey: string; apiSecret: string }> {
        const response = await apiClient.post(`/merchant/loan-partners/${id}/rotate-credentials`);
        return response.data;
    },

    /**
     * Test webhook
     */
    async testWebhook(id: string, webhookUrl: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post(`/merchant/loan-partners/${id}/test-webhook`, { webhookUrl });
        return response.data;
    },
};
