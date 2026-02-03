
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, User, Building2, Store, Smartphone, Landmark, ShieldCheck } from 'lucide-react';

import { RegistrationData } from '@/components/register/types';
import Step1_Principal from '@/components/register/Step1_Principal';
import Step2_Business from '@/components/register/Step2_Business';
import Step3_Branches from '@/components/register/Step3_Branches';
import Step4_Products from '@/components/register/Step4_Products';
import Step5_Settlement from '@/components/register/Step5_Settlement';
import Step6_Compliance from '@/components/register/Step6_Compliance';

const STEPS = [
    { id: 1, title: 'Account', icon: User },
    { id: 2, title: 'Business', icon: Building2 },
    { id: 3, title: 'Branches', icon: Store },
    { id: 4, title: 'Products', icon: Smartphone },
    { id: 5, title: 'Settlement', icon: Landmark },
    { id: 6, title: 'Compliance', icon: ShieldCheck },
];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // NEW: Prevent double-click
    const [submitError, setSubmitError] = useState('');

    const [formData, setFormData] = useState<RegistrationData>({
        // Step 1
        email: '', password: '', confirmPassword: '',
        directorName: '', directorRole: 'Owner', directorPhone: '',
        verificationType: 'NIN', // Default to NIN
        directorNin: '', directorBvn: '', directorDob: '', directorAddress: '',
        directorIdFile: null, directorPassportFile: null,

        // Step 2
        businessName: '', tradingName: '', businessType: 'SOLE_PROPRIETORSHIP',
        rcNumber: '', dateOfIncorporation: '', natureOfBusiness: '',
        yearsInOperation: 0, website: '', businessAddress: '', state: '', lga: '',
        cacCertificateFile: null, cacStatusFile: null,
        tinCertificateFile: null, utilityBillFile: null,
        storeFrontPhoto: null, storeInteriorPhoto: null, // NEW

        // Step 3
        branches: [],

        // Step 4
        productDeclaration: {
            categories: [], brands: [], minPrice: '', maxPrice: '',
            monthlyVolume: '', condition: 'NEW'
        },

        // Step 5
        bankName: '', accountNumber: '', accountName: '',
        accountType: 'Current', bankBvn: '', settlementCycle: 'T+1',

        // Step 6
        agreementsSigned: false, bvnConsent: false,
        creditConsent: false, lockingPolicy: false,
        agreementFile: null
    });

    const updateForm = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async () => {
        // Prevent double-click
        if (isSubmitting) {
            console.log('⚠️ Submission already in progress, ignoring duplicate click');
            return;
        }

        console.log('🚀 Submit button clicked!');
        setIsSubmitting(true);
        setLoading(true);
        setSubmitError('');

        try {
            console.log('📝 Preparing payload (files already uploaded to Blob)...');

            // Files are already uploaded to Vercel Blob, just collect the URLs
            const documents = {
                director_id: formData.directorIdFile,
                director_passport: formData.directorPassportFile,
                cac_cert: formData.cacCertificateFile,
                cac_status: formData.cacStatusFile,
                utility_bill: formData.utilityBillFile,
                tin_cert: formData.tinCertificateFile,
                signed_agreement: formData.agreementFile,
                store_front: formData.storeFrontPhoto, // NEW
                store_interior: formData.storeInteriorPhoto, // NEW
            };

            console.log('✅ Document URLs collected:', Object.keys(documents).filter(k => (documents as any)[k]));

            // 2. Construct Payload
            const payload = {
                // Account & Principal
                email: formData.email,
                contactName: formData.directorName, // Primary Contact
                phone: formData.directorPhone,

                // Business Info
                businessName: formData.businessName,
                tradingName: formData.tradingName || formData.businessName,
                businessType: formData.businessType,
                cacNumber: formData.rcNumber,
                dateOfIncorporation: formData.dateOfIncorporation,
                natureOfBusiness: formData.natureOfBusiness,
                website: formData.website,
                businessAddress: formData.businessAddress,
                operatingAddress: formData.branches[0]?.address || formData.businessAddress, // Primary Ops
                state: formData.state,
                lga: formData.lga,
                yearsInOperation: formData.yearsInOperation,

                // Nested Data
                directors: [{
                    name: formData.directorName,
                    role: formData.directorRole,
                    phone: formData.directorPhone,
                    verificationType: formData.verificationType, // NEW
                    nin: formData.verificationType === 'NIN' ? formData.directorNin : undefined,
                    bvn: formData.verificationType === 'BVN' ? formData.directorBvn : undefined,
                    dob: formData.directorDob,
                    address: formData.directorAddress,
                }],

                branches: formData.branches,

                productDeclaration: formData.productDeclaration,

                bankDetails: {
                    bankName: formData.bankName,
                    accountNumber: formData.accountNumber,
                    accountName: formData.accountName,
                    accountType: formData.accountType,
                    bvn: formData.bankBvn,
                    settlementCycle: formData.settlementCycle
                },

                compliance: {
                    agreementsSigned: formData.agreementsSigned,
                    bvnConsent: formData.bvnConsent,
                    creditConsent: formData.creditConsent,
                    lockingPolicy: formData.lockingPolicy,
                    dataProcessing: true
                },

                documents: documents, // URLs instead of base64

                // Legacy placeholders
                signatories: [],
                operations: { yearsInOp: formData.yearsInOperation },
                deviceDetails: { types: formData.productDeclaration.categories },
                agentDetails: {}
            };

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

            // Generate idempotency key to prevent duplicate submissions
            const idempotencyKey = `${formData.email}-${Date.now()}`;

            console.log('🌐 Submitting to:', `${apiUrl}/auth/merchant/apply`);
            console.log('🔑 Idempotency Key:', idempotencyKey);
            console.log('📦 Payload size:', JSON.stringify(payload).length, 'bytes (much smaller now!)');

            const res = await fetch(`${apiUrl}/auth/merchant/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': idempotencyKey
                },
                body: JSON.stringify(payload),
            });

            console.log('📡 Response status:', res.status, res.statusText);

            if (!res.ok) {
                const data = await res.json();
                console.error('❌ Server error:', data);
                throw new Error(data.message || 'Submission failed');
            }

            const responseData = await res.json();
            console.log('✅ Success!', responseData);

            router.push('/application-submitted');

        } catch (err: any) {
            console.error('💥 Submission error:', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
            setSubmitError(err.message || "An error occurred during submission. Please check the console for details.");
            setLoading(false);
            setIsSubmitting(false); // Reset on error
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 py-8">
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">V</div>
                    <span className="text-xl font-bold tracking-tight">Vistalock Merchant Onboarding</span>
                </div>
                <p className="text-sm text-muted-foreground">Complete the form below to become a verified merchant partner.</p>
            </div>

            <Card className="w-full max-w-4xl shadow-lg">
                <CardHeader className="border-b px-6 py-4 bg-muted/5">
                    {/* Progress Bar */}
                    <div className="flex justify-between items-center w-full px-2">
                        {STEPS.map((s) => (
                            <div key={s.id} className={`flex flex-col items-center gap-2 ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
                                <div className={`
                                    flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300
                                    ${step >= s.id ? 'border-primary bg-primary text-primary-foreground' : 'border-muted bg-background'}
                                    ${step > s.id ? 'bg-primary text-primary-foreground' : ''}
                                `}>
                                    <s.icon className="h-5 w-5" />
                                </div>
                                <span className="text-[10px] md:text-xs font-medium hidden md:block">{s.title}</span>
                            </div>
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="p-6 md:p-8">
                    {submitError && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                            ⚠️ {submitError}
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-50 rounded-lg">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />
                            <p className="font-medium animate-pulse">Submitting Application...</p>
                            <p className="text-xs text-muted-foreground">Uploading documents, please wait.</p>
                        </div>
                    )}

                    {step === 1 && <Step1_Principal formData={formData} updateForm={updateForm} onNext={() => setStep(2)} />}
                    {step === 2 && <Step2_Business formData={formData} updateForm={updateForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                    {step === 3 && <Step3_Branches formData={formData} updateForm={updateForm} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
                    {step === 4 && <Step4_Products formData={formData} updateForm={updateForm} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
                    {step === 5 && <Step5_Settlement formData={formData} updateForm={updateForm} onNext={() => setStep(6)} onBack={() => setStep(4)} />}
                    {step === 6 && <Step6_Compliance formData={formData} updateForm={updateForm} onNext={handleSubmit} onBack={() => setStep(5)} />}

                </CardContent>
            </Card>
        </div>
    );
}
