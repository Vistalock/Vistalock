
export interface RegistrationData {
    // Step 1: Principal
    email: string;
    password?: string;
    confirmPassword?: string;
    directorName: string; // Contact Name / Primary Director
    directorRole: 'Owner' | 'Director' | 'Partner';
    directorPhone: string;
    directorEmail?: string;
    directorNin: string;
    directorBvn: string;
    directorDob: string;
    directorAddress: string;
    directorIdFile: File | null;
    directorPassportFile: File | null; // Passport Photo

    // Step 2: Business
    businessName: string;
    tradingName: string;
    businessType: 'SOLE_PROPRIETORSHIP' | 'LIMITED_LIABILITY' | 'ENTERPRISE';
    rcNumber: string;
    dateOfIncorporation: string;
    natureOfBusiness: string;
    yearsInOperation: number;
    website: string;
    businessAddress: string;
    state: string;
    lga: string;
    cacCertificateFile: File | null;
    cacStatusFile: File | null;
    tinCertificateFile: File | null;
    utilityBillFile: File | null;

    // Step 3: Branches (Dynamic)
    branches: BranchData[];

    // Step 4: Products
    productDeclaration: {
        categories: string[];
        brands: string[]; // Comma separated or array
        minPrice: string;
        maxPrice: string;
        monthlyVolume: string;
        condition: 'NEW' | 'REFURB' | 'BOTH';
    };

    // Step 5: Bank
    bankName: string;
    accountNumber: string;
    accountName: string;
    accountType: 'Savings' | 'Current';
    bankBvn: string;
    settlementCycle: 'Instant' | 'T+1' | 'T+2' | 'Weekly';

    // Step 6: Compliance
    agreementsSigned: boolean;
    bvnConsent: boolean;
    creditConsent: boolean;
    lockingPolicy: boolean;
    agreementFile: File | null;
}

export interface BranchData {
    id: string; // Temporary ID for UI
    name: string;
    address: string;
    state: string;
    managerName: string;
    managerPhone: string;
    operatingHours: string;
}

export interface StepProps {
    formData: RegistrationData;
    updateForm: (field: keyof RegistrationData | string, value: any) => void;
    onNext?: () => void;
    onBack?: () => void;
}
