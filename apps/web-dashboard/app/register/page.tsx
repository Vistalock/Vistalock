'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Loader2, Building2, User, Landmark, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const STEPS = [
    { id: 1, title: 'Account', icon: User },
    { id: 2, title: 'Business', icon: Building2 },
    { id: 3, title: 'Director & Bank', icon: Landmark },
    { id: 4, title: 'Compliance', icon: ShieldCheck },
];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [token, setToken] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1
        email: '',
        password: '',
        confirmPassword: '',
        // Step 2
        businessName: '',
        businessType: 'SOLE_PROPRIETORSHIP',
        rcNumber: '',
        businessAddress: '',
        // Step 3
        directorName: '',
        directorPhone: '',
        directorNin: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
        // Step 4
        agreementsSigned: false,
    });

    // File State
    const [directorFile, setDirectorFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError('');

        if (!file) {
            setDirectorFile(null);
            return;
        }

        // Security Check: File Type
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setFileError('Invalid file type. Only JPG, PNG, and PDF are allowed.');
            e.target.value = ''; // Reset input
            return;
        }

        // Security Check: File Size (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setFileError('File size too large. Maximum size is 5MB.');
            e.target.value = ''; // Reset input
            return;
        }

        setDirectorFile(file);
    };

    const updateForm = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate current step
            if (step === 1) {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
                if (!passwordRegex.test(formData.password)) {
                    throw new Error('Password must contain only letters, numbers, and symbols');
                }
                if (formData.password.length < 12) {
                    throw new Error('Password must be at least 12 characters long');
                }
            } else if (step === 2) {
                if (!formData.businessName || !formData.rcNumber || !formData.businessAddress) {
                    throw new Error("Please fill all business fields");
                }
            } else if (step === 3) {
                if (!formData.directorName || !formData.directorPhone || !formData.accountNumber) {
                    throw new Error("Please fill all fields");
                }
                if (!/^\d{11}$/.test(formData.directorPhone)) {
                    throw new Error("Director phone number must be exactly 11 digits");
                }
                if (!directorFile) {
                    throw new Error("Please upload a valid Director ID document");
                }
                if (!/^\d{11}$/.test(formData.directorNin)) {
                    throw new Error("NIN must be exactly 11 numeric digits");
                }
                if (!/^\d{10}$/.test(formData.accountNumber)) {
                    throw new Error("Account number must be exactly 10 digits");
                }
            } else if (step === 4) {
                // Final Submission - Submit Merchant Application
                if (!formData.agreementsSigned) {
                    throw new Error("You must agree to the terms.");
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

                // Convert file to Base64 securely
                let documentsData = {};
                if (directorFile) {
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(directorFile);
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = error => reject(error);
                    });

                    documentsData = {
                        directorId: {
                            name: directorFile.name,
                            type: directorFile.type,
                            size: directorFile.size,
                            content: base64 // Secure Data URL
                        }
                    };
                }

                const applicationData = {
                    // Contact & Email
                    email: formData.email,
                    contactName: formData.directorName,
                    phone: formData.directorPhone,

                    // Business Info
                    businessName: formData.businessName,
                    tradingName: formData.businessName, // Same as business name
                    businessType: formData.businessType,
                    cacNumber: formData.rcNumber,
                    natureOfBusiness: 'Device Financing', // Default
                    businessAddress: formData.businessAddress,
                    operatingAddress: formData.businessAddress,

                    // Bank Details (as JSON)
                    bankDetails: {
                        bankName: formData.bankName,
                        accountNumber: formData.accountNumber,
                        accountName: formData.accountName || formData.businessName
                    },

                    // Directors (as array)
                    directors: [{
                        name: formData.directorName,
                        phone: formData.directorPhone,
                        nin: formData.directorNin
                    }],

                    // Compliance
                    compliance: {
                        agreementsSigned: formData.agreementsSigned,
                        submittedAt: new Date().toISOString()
                    },

                    // Empty required fields
                    signatories: [],
                    operations: {},
                    deviceDetails: {},
                    agentDetails: {},
                    documents: documentsData
                };

                const res = await fetch(`${apiUrl}/auth/merchant/apply`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(applicationData),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Application submission failed');
                }

                router.push('/application-submitted');
                return;
            }

            setStep(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="mb-8 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">V</div>
                <span className="text-xl font-bold tracking-tight">Vistalock Merchant Onboarding</span>
            </div>

            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex justify-between items-center mb-6">
                        {STEPS.map((s) => (
                            <div key={s.id} className={`flex flex-col items-center gap-2 ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step >= s.id ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                                    <s.icon className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium">{s.title}</span>
                            </div>
                        ))}
                    </div>
                </CardHeader>

                <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold">{STEPS[step - 1].title} Details</h2>
                    <p className="text-sm text-muted-foreground">Step {step} of 4</p>
                </div>

                <form onSubmit={handleNext}>
                    <CardContent className="space-y-4">
                        {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm text-center">{error}</div>}

                        {/* Step 1: Account */}
                        {step === 1 && (
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <Input type="email" required value={formData.email} onChange={e => updateForm('email', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Password (Min 12 chars, symbols)</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={formData.password}
                                            onChange={e => updateForm('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={e => updateForm('confirmPassword', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Step 2: Business */}
                        {step === 2 && (
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label>Legal Business Name</Label>
                                    <Input required value={formData.businessName} onChange={e => updateForm('businessName', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Business Type</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={formData.businessType}
                                        onChange={e => updateForm('businessType', e.target.value)}
                                    >
                                        <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                                        <option value="LIMITED_LIABILITY">Limited Liability (Ltd/PLC)</option>
                                        <option value="ENTERPRISE">Enterprise</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>RC / BN Number</Label>
                                    <Input required value={formData.rcNumber} onChange={e => updateForm('rcNumber', e.target.value)} placeholder="e.g. RC123456 or BN987654" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Office Address</Label>
                                    <Input required value={formData.businessAddress} onChange={e => updateForm('businessAddress', e.target.value)} />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Director & Bank */}
                        {step === 3 && (
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label>Director Full Name</Label>
                                    <Input required value={formData.directorName} onChange={e => updateForm('directorName', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Phone Number</Label>
                                    <Input required value={formData.directorPhone} onChange={e => updateForm('directorPhone', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>NIN (National ID)</Label>
                                    <Input required value={formData.directorNin} onChange={e => updateForm('directorNin', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Director ID (Passport/NIN/DL)</Label>
                                    <Input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleFileChange}
                                        className="cursor-pointer text-muted-foreground file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                    />
                                    {fileError && <p className="text-sm text-red-500">{fileError}</p>}
                                    <p className="text-[0.8rem] text-muted-foreground">Upload a clear image or PDF of your identification document (Max 5MB).</p>
                                </div>
                                <div className="border-t pt-4 mt-2">
                                    <h4 className="font-semibold mb-2">Settlement Account</h4>
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label>Bank Name</Label>
                                            <Input required value={formData.bankName} onChange={e => updateForm('bankName', e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Account Number</Label>
                                            <Input required value={formData.accountNumber} onChange={e => updateForm('accountNumber', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Compliance */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="rounded-lg border p-4 bg-muted/20 text-sm">
                                    <h4 className="font-semibold mb-2">Merchant Agreement</h4>
                                    <p className="text-muted-foreground">
                                        By signing up, you agree to comply with VistaLock's anti-fraud policies, data protection regulations (NDPR/GDPR), and accept responsibility for customer consent collection.
                                    </p>
                                    <ul className="list-disc list-inside mt-2 text-muted-foreground">
                                        <li>I confirm all provided information is accurate.</li>
                                        <li>I authorize VistaLock to verify my business details.</li>
                                        <li>I understand that device locking is a regulated activity.</li>
                                    </ul>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={formData.agreementsSigned}
                                        onCheckedChange={(checked) => updateForm('agreementsSigned', checked === true)}
                                    />
                                    <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        I accept the Merchant Agreement & Terms of Service
                                    </label>
                                </div>
                            </div>
                        )}

                    </CardContent>
                    <CardFooter className="flex justify-between mt-6">
                        {step > 1 && (
                            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                                Back
                            </Button>
                        )}
                        <Button type="submit" className="ml-auto" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {step === 4 ? 'Complete Registration' : 'Next Step'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
