
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, FileCheck } from 'lucide-react';
import { StepProps } from './types';
import { FileUploader } from './FileUploader';

export default function Step6_Compliance({ formData, updateForm, onNext, onBack }: StepProps & { loading?: boolean }) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.agreementsSigned) newErrors.agreementsSigned = "Must accept terms";
        if (!formData.bvnConsent) newErrors.bvnConsent = "Consent required";
        if (!formData.creditConsent) newErrors.creditConsent = "Consent required";
        if (!formData.lockingPolicy) newErrors.lockingPolicy = "Must agree to locking policy";
        if (!formData.agreementFile) newErrors.agreementFile = "Signed PDF required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onNext?.(); // This triggers submission in parent
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">8. Verification & Compliance</h3>

            <Alert className="bg-muted/50 border-primary/20">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <AlertTitle>Data Privacy Notice</AlertTitle>
                <AlertDescription>
                    VistaLock complies with NDPR/GDPR. Your BVN and NIN are used solely for identity verification and fraud prevention. We do not store your biometrics.
                </AlertDescription>
            </Alert>

            <div className="space-y-4 pt-2">
                <h4 className="font-semibold text-sm">Declarations</h4>

                <div className="flex items-start space-x-3">
                    <Checkbox
                        id="bvn"
                        checked={formData.bvnConsent}
                        onCheckedChange={(c) => updateForm('bvnConsent', c === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label htmlFor="bvn" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Identity Verification Consent
                        </label>
                        <p className="text-sm text-muted-foreground">
                            I authorize VistaLock to verify my BVN and NIN against government databases.
                        </p>
                        {errors.bvnConsent && <p className="text-xs text-red-500">{errors.bvnConsent}</p>}
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                    <Checkbox
                        id="credit"
                        checked={formData.creditConsent}
                        onCheckedChange={(c) => updateForm('creditConsent', c === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label htmlFor="credit" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Credit Check Consent
                        </label>
                        <p className="text-sm text-muted-foreground">
                            I authorize VistaLock to perform credit stops and review my credit history via licensed bureaus.
                        </p>
                        {errors.creditConsent && <p className="text-xs text-red-500">{errors.creditConsent}</p>}
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                    <Checkbox
                        id="lock"
                        checked={formData.lockingPolicy}
                        onCheckedChange={(c) => updateForm('lockingPolicy', c === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label htmlFor="lock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Device Locking Policy
                        </label>
                        <p className="text-sm text-muted-foreground">
                            I understand that devices financed via VistaLock include software that locks the device upon non-payment. Tampering with this software is a breach of contract.
                        </p>
                        {errors.lockingPolicy && <p className="text-xs text-red-500">{errors.lockingPolicy}</p>}
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                    <Checkbox
                        id="terms"
                        checked={formData.agreementsSigned}
                        onCheckedChange={(c) => updateForm('agreementsSigned', c === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Merchant Agreement & Accuracy
                        </label>
                        <p className="text-sm text-muted-foreground">
                            I confirm that all information provided is accurate and I agree to the <a href="#" className="underline text-primary">Terms of Service</a>.
                        </p>
                        {errors.agreementsSigned && <p className="text-xs text-red-500">{errors.agreementsSigned}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">9. Upload Signed Agreement</h3>
                <div className="grid gap-4 sm:grid-cols-1">
                    <div className="space-y-2">
                        <FileUploader
                            label="Signed VistaLock Merchant Agreement (PDF)"
                            file={formData.agreementFile}
                            onFileChange={val => updateForm('agreementFile', val)}
                            accept=".pdf"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            <a href="#" className="text-primary underline flex items-center gap-1">
                                <FileCheck className="h-3 w-3" /> Download Template
                            </a>
                        </p>
                        {errors.agreementFile && <p className="text-xs text-red-500">{errors.agreementFile}</p>}
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={handleSubmit} className="px-6 py-2.5">
                    Submit Application
                </Button>
            </div>
        </div>
    );
}
