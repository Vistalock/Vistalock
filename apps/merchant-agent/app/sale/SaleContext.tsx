import React, { createContext, useContext, useState } from 'react';

type Product = {
    id: string;
    name: string;
    price: number | string;
    minDownPayment: number | string;
    minTenure: number;
    maxTenure: number;
    interestRate: number | string;
};

type CustomerInfo = {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    nin?: string;
    selfieUrl?: string;
    idCardUrl?: string;
};

interface SaleContextProps {
    product: Product | null;
    setProduct: (p: Product) => void;
    imei: string;
    setImei: (i: string) => void;
    customerInfo: CustomerInfo | null;
    setCustomerInfo: (c: CustomerInfo) => void;
    downPayment: number;
    setDownPayment: (d: number) => void;
    tenureMonths: number;
    setTenureMonths: (t: number) => void;
    resetSale: () => void;
}

const SaleContext = createContext<SaleContextProps | undefined>(undefined);

export function SaleProvider({ children }: { children: React.ReactNode }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [imei, setImei] = useState('');
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [downPayment, setDownPayment] = useState(0);
    const [tenureMonths, setTenureMonths] = useState(3);

    const resetSale = () => {
        setProduct(null);
        setImei('');
        setCustomerInfo(null);
        setDownPayment(0);
        setTenureMonths(3);
    };

    return (
        <SaleContext.Provider value={{
            product, setProduct,
            imei, setImei,
            customerInfo, setCustomerInfo,
            downPayment, setDownPayment,
            tenureMonths, setTenureMonths,
            resetSale
        }}>
            {children}
        </SaleContext.Provider>
    );
}

export function useSaleContext() {
    const context = useContext(SaleContext);
    if (!context) throw new Error("useSaleContext must be used within a SaleProvider");
    return context;
}
