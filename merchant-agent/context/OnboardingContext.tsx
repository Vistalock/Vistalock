import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types for onboarding data
export interface CustomerData {
    phoneNumber: string;
    verified: boolean;
    firstName?: string;
    lastName?: string;
    nin?: string;
    bvn?: string;
    dob?: string;
    address?: string;
    photoUrl?: string; // KYC photo
}

export interface DeviceData {
    id: string;
    name: string;
    price: number;
    imei?: string;
    serialNumber?: string;
}

export interface LoanTerms {
    durationMonths: number;
    initialDeposit: number; // Down payment
    monthlyRepayment: number;
    interestRate: number;
    totalRepayment: number;
}

export interface CreditCheckResult {
    status: 'APPROVED' | 'REJECTED' | 'ReviewRequired';
    score?: number;
    limit?: number;
    message?: string;
    checkId?: string;
}

interface OnboardingState {
    step: number;
    customer: CustomerData;
    selectedDevice?: DeviceData;
    loanTerms?: LoanTerms;
    creditCheck?: CreditCheckResult;
    deviceImei?: string;
    signature?: string; // Base64 signature
    consentGiven: boolean;
}

interface OnboardingContextType {
    state: OnboardingState;
    updateCustomer: (data: Partial<CustomerData>) => void;
    selectDevice: (device: DeviceData) => void;
    setLoanTerms: (terms: LoanTerms) => void;
    updateCreditCheck: (result: CreditCheckResult) => void;
    setDeviceImei: (imei: string) => void;
    setSignature: (signature: string) => void;
    setConsent: (consent: boolean) => void;
    nextStep: () => void;
    prevStep: () => void;
    resetOnboarding: () => void;
}

const defaultState: OnboardingState = {
    step: 1,
    customer: {
        phoneNumber: '',
        verified: false,
    },
    consentGiven: false,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<OnboardingState>(defaultState);

    const updateCustomer = (data: Partial<CustomerData>) => {
        setState((prev) => ({
            ...prev,
            customer: { ...prev.customer, ...data },
        }));
    };

    const selectDevice = (device: DeviceData) => {
        setState((prev) => ({ ...prev, selectedDevice: device }));
    };

    const setLoanTerms = (terms: LoanTerms) => {
        setState((prev) => ({ ...prev, loanTerms: terms }));
    };

    const updateCreditCheck = (result: CreditCheckResult) => {
        setState((prev) => ({ ...prev, creditCheck: result }));
    };

    const setDeviceImei = (imei: string) => {
        setState((prev) => ({ ...prev, deviceImei: imei }));
    };

    const setSignature = (signature: string) => {
        setState((prev) => ({ ...prev, signature }));
    };

    const setConsent = (consent: boolean) => {
        setState((prev) => ({ ...prev, consentGiven: consent }));
    };

    const nextStep = () => {
        setState((prev) => ({ ...prev, step: prev.step + 1 }));
    };

    const prevStep = () => {
        setState((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) }));
    };

    const resetOnboarding = () => {
        setState(defaultState);
    };

    return (
        <OnboardingContext.Provider
            value={{
                state,
                updateCustomer,
                selectDevice,
                setLoanTerms,
                updateCreditCheck,
                setDeviceImei,
                setSignature,
                setConsent,
                nextStep,
                prevStep,
                resetOnboarding,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
}
