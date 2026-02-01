
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepProps } from './types';
import { FileUploader } from './FileUploader';

export default function Step2_Business({ formData, updateForm, onNext, onBack }: StepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        // Business Info
        if (!formData.businessName) newErrors.businessName = "Required";
        if (!formData.rcNumber) newErrors.rcNumber = "Required";
        if (!formData.dateOfIncorporation) newErrors.dateOfIncorporation = "Required";
        if (!formData.natureOfBusiness) newErrors.natureOfBusiness = "Required";
        if (!formData.yearsInOperation) newErrors.yearsInOperation = "Required";
        if (!formData.businessAddress) newErrors.businessAddress = "Required";
        if (!formData.state) newErrors.state = "Required";
        if (!formData.lga) newErrors.lga = "Required";

        // Files
        if (!formData.cacCertificateFile) newErrors.cacCertificateFile = "Certificate required";
        if (!formData.cacStatusFile) newErrors.cacStatusFile = "Status Report (CO2/CO7) required";
        if (!formData.utilityBillFile) newErrors.utilityBillFile = "Utility Bill required";
        // TIN is optional or mandatory? "Mandatory Uploads" list implies mandatory.
        // User list says "TIN Certificate (if available)". So Optional.

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onNext?.();
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">3. Business Information</h3>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Legal Business Name (As on CAC)</Label>
                    <Input
                        value={formData.businessName}
                        onChange={e => updateForm('businessName', e.target.value)}
                        className={errors.businessName ? "border-red-500" : ""}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Trading / Store Name</Label>
                    <Input
                        value={formData.tradingName}
                        onChange={e => updateForm('tradingName', e.target.value)}
                        placeholder="Same as legal name if empty"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Select
                        value={formData.businessType}
                        onValueChange={val => updateForm('businessType', val)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SOLE_PROPRIETORSHIP">Sole Proprietorship / BN</SelectItem>
                            <SelectItem value="LIMITED_LIABILITY">Limited Liability (Ltd/PLC)</SelectItem>
                            <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>RC / BN Number</Label>
                    <Input
                        value={formData.rcNumber}
                        onChange={e => updateForm('rcNumber', e.target.value)}
                        className={errors.rcNumber ? "border-red-500" : ""}
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Date of Incorporation</Label>
                    <Input
                        type="date"
                        value={formData.dateOfIncorporation}
                        onChange={e => updateForm('dateOfIncorporation', e.target.value)}
                        className={errors.dateOfIncorporation ? "border-red-500" : ""}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Years in Operation</Label>
                    <Input
                        type="number"
                        min="0"
                        value={formData.yearsInOperation}
                        onChange={e => updateForm('yearsInOperation', parseInt(e.target.value) || 0)}
                        className={errors.yearsInOperation ? "border-red-500" : ""}
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Nature of Business</Label>
                    <Input
                        value={formData.natureOfBusiness}
                        onChange={e => updateForm('natureOfBusiness', e.target.value)}
                        placeholder="e.g. Electronics Retail, Phone Store"
                        className={errors.natureOfBusiness ? "border-red-500" : ""}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Website / Social Media (Optional)</Label>
                    <Input
                        value={formData.website}
                        onChange={e => updateForm('website', e.target.value)}
                        placeholder="https://..."
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Registered Office Address</Label>
                <Input
                    value={formData.businessAddress}
                    onChange={e => updateForm('businessAddress', e.target.value)}
                    className={errors.businessAddress ? "border-red-500" : ""}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                        value={formData.state}
                        onChange={e => updateForm('state', e.target.value)}
                        placeholder="e.g. Lagos"
                        className={errors.state ? "border-red-500" : ""}
                    />
                </div>
                <div className="space-y-2">
                    <Label>L.G.A.</Label>
                    <Input
                        value={formData.lga}
                        onChange={e => updateForm('lga', e.target.value)}
                        placeholder="e.g. Ikeja"
                        className={errors.lga ? "border-red-500" : ""}
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">4. Business Documents</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <FileUploader
                            label="CAC Certificate"
                            file={formData.cacCertificateFile}
                            onFileChange={val => updateForm('cacCertificateFile', val)}
                            required
                        />
                        {errors.cacCertificateFile && <p className="text-xs text-red-500">{errors.cacCertificateFile}</p>}
                    </div>
                    <div className="space-y-2">
                        <FileUploader
                            label="CAC Status Report (CO2/CO7)"
                            file={formData.cacStatusFile}
                            onFileChange={val => updateForm('cacStatusFile', val)}
                            required
                        />
                        {errors.cacStatusFile && <p className="text-xs text-red-500">{errors.cacStatusFile}</p>}
                    </div>
                    <div className="space-y-2">
                        <FileUploader
                            label="Utility Bill (Max 3 months old)"
                            file={formData.utilityBillFile}
                            onFileChange={val => updateForm('utilityBillFile', val)}
                            required
                        />
                        {errors.utilityBillFile && <p className="text-xs text-red-500">{errors.utilityBillFile}</p>}
                    </div>
                    <div className="space-y-2">
                        <FileUploader
                            label="TIN Certificate (Optional)"
                            file={formData.tinCertificateFile}
                            onFileChange={val => updateForm('tinCertificateFile', val)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={handleNext}>Next Step</Button>
            </div>
        </div>
    );
}
