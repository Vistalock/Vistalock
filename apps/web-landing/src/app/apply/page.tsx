
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, Upload, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MerchantApplyPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Initial State Structure matching Schema
    const [formData, setFormData] = useState({
        // 1. Business Info
        businessName: '',
        tradingName: '',
        businessType: 'Sole Proprietor',
        cacNumber: '',
        dateOfIncorporation: '',
        natureOfBusiness: '',
        website: '',

        // 2. Contact & Address
        contactName: '',
        email: '',
        phone: '',
        businessAddress: '',
        operatingAddress: '',

        // 3. Directors (Array)
        directors: [{ name: '', dob: '', nationality: '', address: '', idNumber: '', share: '' }],

        // 4. Signatories (Array)
        signatories: [{ name: '', role: '', contact: '', idNumber: '' }],

        // 5. Bank Details
        bankDetails: { bankName: '', accountName: '', accountNumber: '', bvn: '', settlementCycle: 'Daily' },

        // 6. Operations
        operations: { yearsInOp: '', outlets: '', monthlyVolume: '', avgPrice: '', salesChannels: '' },

        // 7. Devices
        deviceDetails: { types: ['Android'], specs: '', source: '', support: '' },

        // 8. Agents
        agentDetails: { expectedCount: '', location: '', onboardingMethod: 'POS' },

        // 9. Compliance
        compliance: { dataProcessing: false, lockingPolicy: false, enforcement: false, revenueShare: false },

        // 10. Documents (Mock URL/File)
        documents: { certificate: null, cacStatus: null, idCard: null, utilityBill: null }
    });

    const totalSteps = 10;

    const handleDirectorChange = (index: number, field: string, value: string) => {
        const newDirectors = [...formData.directors];
        newDirectors[index] = { ...newDirectors[index], [field]: value };
        setFormData({ ...formData, directors: newDirectors });
    };

    const addDirector = () => setFormData({ ...formData, directors: [...formData.directors, { name: '', dob: '', nationality: '', address: '', idNumber: '', share: '' }] });
    const removeDirector = (index: number) => setFormData({ ...formData, directors: formData.directors.filter((_, i) => i !== index) });

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/auth/merchant/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            setSuccess(true);
        } catch (error) {
            console.error('Submission failed', error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const fillDemoData = () => {
        setFormData({
            businessName: 'VistaLock Enterprises',
            tradingName: 'VistaLock',
            businessType: 'Limited Liability Company',
            cacNumber: 'RC1234567',
            dateOfIncorporation: '2020-01-01',
            natureOfBusiness: 'Device Financing',
            website: 'https://vistalock.example.com',
            contactName: 'John Doe',
            email: 'admin@vistalock.example.com',
            phone: '08012345678', // Strict 11 digits
            businessAddress: '123 Innovation Drive, Lagos',
            operatingAddress: '123 Innovation Drive, Lagos',
            directors: [{ name: 'Jane Doe', dob: '1980-05-15', nationality: 'Nigerian', address: '456 Estate Road', idNumber: 'A0000000', share: '50' }],
            signatories: [{ name: 'John Doe', role: 'CEO', contact: '08012345678', idNumber: 'B0000000' }],
            bankDetails: { bankName: 'Access Bank', accountName: 'VistaLock Ent', accountNumber: '0123456789', bvn: '12345678901', settlementCycle: 'Daily' },
            operations: { yearsInOp: '5', outlets: '3', monthlyVolume: '500', avgPrice: '150000', salesChannels: 'Online & Instore' },
            deviceDetails: { types: ['Android'], specs: '4GB RAM, 64GB ROM', source: 'OEM Direct', support: 'In-house' },
            agentDetails: { expectedCount: '10', location: 'Ikeja', onboardingMethod: 'Mobile App' },
            compliance: { dataProcessing: true, lockingPolicy: true, enforcement: false, revenueShare: true },
            documents: { certificate: null, cacStatus: null, idCard: null, utilityBill: null }
        });
    };

    if (success) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto text-center">
                <div className="bg-white p-8 rounded-lg shadow-lg border border-green-100 space-y-4">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Application Received!</h2>
                    <p className="text-gray-600">
                        Thank you for applying to become a VistaLock Merchant. <br />
                        Our compliance team will review your details (including business reg, directors, and operations) and get back to you within 24-48 hours.
                    </p>
                    <div className="pt-4">
                        <Button onClick={() => router.push('/')} className="w-full sm:w-auto">
                            Return to Home
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex justify-between items-start">
                    <div className="text-center flex-1">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Merchant Application</h1>
                        <p className="mt-2 text-sm text-gray-600">Step {step} of {totalSteps}: {
                            ['Business Info', 'Address', 'Directors', 'Signatories', 'Bank Details', 'Operations', 'Devices', 'Agents', 'Compliance', 'Documents'][step - 1]
                        }</p>
                    </div>
                    <Button variant="outline" onClick={fillDemoData} className="ml-4">
                        Demo Fill
                    </Button>
                </div>

                <div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {step === 1 && "Business Information"}
                            {step === 2 && "Business Address & Contact"}
                            {step === 3 && "Ownership & Directors"}
                            {step === 4 && "Authorized Signatories"}
                            {step === 5 && "Bank & Settlement"}
                            {step === 6 && "Business Operations"}
                            {step === 7 && "Device Information"}
                            {step === 8 && "Agent Network"}
                            {step === 9 && "Compliance & Declarations"}
                            {step === 10 && "Document Uploads"}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 && "Verify your legal entity details."}
                            {step === 3 && "KYC/AML compliance for owners."}
                            {step === 10 && "Please upload clear PDF or JPG files."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* STEP 1: BUSINESS INFO */}
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Legal Business Name *</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Trading Name</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.tradingName} onChange={e => setFormData({ ...formData, tradingName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Business Type</label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.businessType} onChange={e => setFormData({ ...formData, businessType: e.target.value })}>
                                        <option>Sole Proprietor</option>
                                        <option>Partnership</option>
                                        <option>Limited Liability Company</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">CAC / Reg Number</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.cacNumber} onChange={e => setFormData({ ...formData, cacNumber: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date of Incorporation</label>
                                    <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.dateOfIncorporation} onChange={e => setFormData({ ...formData, dateOfIncorporation: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nature of Business</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.natureOfBusiness} onChange={e => setFormData({ ...formData, natureOfBusiness: e.target.value })} placeholder="e.g. Mobile Phones Retail" />
                                </div>
                            </div>
                        )}

                        {/* STEP 2: ADDRESS */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Official Email *</label>
                                        <input type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Official Phone *</label>
                                        <input type="tel" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Contact Person Name</label>
                                        <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Registered Address</label>
                                    <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.businessAddress} onChange={e => setFormData({ ...formData, businessAddress: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Operating Address (if different)</label>
                                    <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.operatingAddress} onChange={e => setFormData({ ...formData, operatingAddress: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DIRECTORS */}
                        {step === 3 && (
                            <div className="space-y-6">
                                {formData.directors.map((director, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg bg-gray-50 relative">
                                        <h4 className="font-semibold mb-2">Director {idx + 1}</h4>
                                        <button onClick={() => removeDirector(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input placeholder="Full Name" className="p-2 border rounded"
                                                value={director.name} onChange={e => handleDirectorChange(idx, 'name', e.target.value)} />
                                            <input placeholder="Nationality" className="p-2 border rounded"
                                                value={director.nationality} onChange={e => handleDirectorChange(idx, 'nationality', e.target.value)} />
                                            <input placeholder="Phone / Contact" className="p-2 border rounded"
                                                value={director.address} onChange={e => handleDirectorChange(idx, 'address', e.target.value)} />
                                            <input placeholder="ID Number (NIN/Passport)" className="p-2 border rounded"
                                                value={director.idNumber} onChange={e => handleDirectorChange(idx, 'idNumber', e.target.value)} />
                                            <input placeholder="Ownership %" className="p-2 border rounded" type="number"
                                                value={director.share} onChange={e => handleDirectorChange(idx, 'share', e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={addDirector} className="w-full">
                                    <Plus className="mr-2 h-4 w-4" /> Add Director
                                </Button>
                            </div>
                        )}

                        {/* STEP 4: SIGNATORIES */}
                        {step === 4 && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">Who is authorized to sign for this business?</p>
                                {formData.signatories.map((sig, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                                        <input placeholder="Full Name" className="p-2 border rounded"
                                            value={sig.name} onChange={e => {
                                                const newSigs = [...formData.signatories];
                                                newSigs[idx].name = e.target.value;
                                                setFormData({ ...formData, signatories: newSigs });
                                            }} />
                                        <input placeholder="Role / Position" className="p-2 border rounded"
                                            value={sig.role} onChange={e => {
                                                const newSigs = [...formData.signatories];
                                                newSigs[idx].role = e.target.value;
                                                setFormData({ ...formData, signatories: newSigs });
                                            }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* STEP 5: BANK DETAILS */}
                        {step === 5 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Bank Name</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.bankDetails.bankName} onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Account Number</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.bankDetails.accountNumber} onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Account Name</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.bankDetails.accountName} onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountName: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">BVN</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.bankDetails.bvn} onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bvn: e.target.value } })} />
                                </div>
                            </div>
                        )}

                        {/* STEP 6: OPERATIONS */}
                        {step === 6 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Years in Operation</label>
                                    <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.operations.yearsInOp} onChange={e => setFormData({ ...formData, operations: { ...formData.operations, yearsInOp: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Monthly Device Volume (Est.)</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.operations.monthlyVolume} onChange={e => setFormData({ ...formData, operations: { ...formData.operations, monthlyVolume: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Number of Outlets</label>
                                    <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.operations.outlets} onChange={e => setFormData({ ...formData, operations: { ...formData.operations, outlets: e.target.value } })} />
                                </div>
                            </div>
                        )}

                        {/* STEP 7: DEVICES */}
                        {step === 7 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Device Types Sold</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked readOnly className="accent-blue-600" /> Android (Mandatory)
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" onChange={e => {
                                                const types = e.target.checked
                                                    ? [...formData.deviceDetails.types, 'iPhone']
                                                    : formData.deviceDetails.types.filter(t => t !== 'iPhone');
                                                setFormData({ ...formData, deviceDetails: { ...formData.deviceDetails, types } });
                                            }} /> iPhone / Other
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Source of Devices (OEM / Distributor)</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.deviceDetails.source} onChange={e => setFormData({ ...formData, deviceDetails: { ...formData.deviceDetails, source: e.target.value } })} />
                                </div>
                            </div>
                        )}

                        {/* STEP 8: AGENTS */}
                        {step === 8 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Expected Number of Agents</label>
                                    <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.agentDetails.expectedCount} onChange={e => setFormData({ ...formData, agentDetails: { ...formData.agentDetails, expectedCount: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Primary Location</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.agentDetails.location} onChange={e => setFormData({ ...formData, agentDetails: { ...formData.agentDetails, location: e.target.value } })} />
                                </div>
                            </div>
                        )}

                        {/* STEP 9: COMPLIANCE */}
                        {step === 9 && (
                            <div className="space-y-4 border p-4 rounded bg-blue-50">
                                <label className="flex items-start gap-2">
                                    <input type="checkbox" className="mt-1"
                                        checked={formData.compliance.dataProcessing} onChange={e => setFormData({ ...formData, compliance: { ...formData.compliance, dataProcessing: e.target.checked } })} />
                                    <span className="text-sm">I consent to the processing of customer data for KYC and credit checks.</span>
                                </label>
                                <label className="flex items-start gap-2">
                                    <input type="checkbox" className="mt-1"
                                        checked={formData.compliance.lockingPolicy} onChange={e => setFormData({ ...formData, compliance: { ...formData.compliance, lockingPolicy: e.target.checked } })} />
                                    <span className="text-sm">I agree to the device locking enforcement policies for defaulted loans.</span>
                                </label>
                                <label className="flex items-start gap-2">
                                    <input type="checkbox" className="mt-1"
                                        checked={formData.compliance.revenueShare} onChange={e => setFormData({ ...formData, compliance: { ...formData.compliance, revenueShare: e.target.checked } })} />
                                    <span className="text-sm">I specify that I understand the revenue share and penalty structure.</span>
                                </label>
                            </div>
                        )}

                        {/* STEP 10: DOCUMENTS */}
                        {step === 10 && (
                            <div className="space-y-6">
                                <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">Note: For this demo, file uploads are simulated. Please ensure you have these documents ready for the compliance team.</p>
                                {[
                                    { key: 'certificate', label: 'Certificate of Incorporation' },
                                    { key: 'cacStatus', label: 'CAC Status Report' },
                                    { key: 'idCard', label: 'Director ID' },
                                    { key: 'utilityBill', label: 'Proof of Address / Utility Bill' }
                                ].map((doc) => (
                                    <div key={doc.key} className="flex items-center gap-4 border p-4 rounded-lg">
                                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Upload className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{doc.label}</p>
                                            <p className="text-xs text-gray-500">PDF or JPG, max 5MB</p>
                                        </div>
                                        <Button variant="outline" size="sm" type="button" onClick={() => alert("Upload simulation: File selected.")}>
                                            Choose File
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                    </CardContent>

                    <div className="p-6 border-t bg-gray-50 flex justify-between">
                        <Button variant="outline" onClick={prevStep} disabled={step === 1 || submitting}>
                            Back
                        </Button>
                        {step < totalSteps ? (
                            <Button onClick={nextStep}>Next</Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={submitting}>
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Submit Application
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
