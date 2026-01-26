
export interface PaymentInitializeResponse {
    authorizationUrl: string;
    reference: string;
    accessCode?: string;
}

export interface PaymentVerifyResponse {
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    amount: number;
    currency: string;
    reference: string;
    metadata: any;
    paidAt?: Date;
}

export interface SubaccountResponse {
    subaccountCode: string;
    businessName: string;
    settlementBank: string;
    accountNumber: string;
}

export interface PaymentProvider {
    /**
     * Initialize a transaction
     * @param amount Amount in kobo/cents (e.g., 500000 for 5000.00)
     * @param email Customer email
     * @param metadata Custom data
     * @param subaccount optional subaccount code for split payment
     */
    initializePayment(
        amount: number,
        email: string,
        metadata: any,
        subaccount?: string
    ): Promise<PaymentInitializeResponse>;

    /**
     * Verify a transaction by reference
     * @param reference Transaction reference
     */
    verifyTransaction(reference: string): Promise<PaymentVerifyResponse>;

    /**
     * Create a subaccount for a merchant
     * @param businessName Name of the business
     * @param bankCode Bank code (e.g., "057" for Zenith)
     * @param accountNumber Account number
     * @param percentageCharge Percentage Vistalock takes (default 0)
     */
    createSubaccount(
        businessName: string,
        bankCode: string,
        accountNumber: string,
        percentageCharge?: number
    ): Promise<SubaccountResponse>;
}
