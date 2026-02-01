
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepProps } from './types';

export default function Step5_Settlement({ formData, updateForm, onNext, onBack }: StepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.bankName) newErrors.bankName = "Required";
        if (!formData.accountNumber || formData.accountNumber.length !== 10) newErrors.accountNumber = "10 Digit NUBAN required";
        if (!formData.accountName) newErrors.accountName = "Required";
        if (!formData.accountType) newErrors.accountType = "Required";
        if (!formData.bankBvn || formData.bankBvn.length !== 11) newErrors.bankBvn = "11 Digit BVN required";
        if (!formData.settlementCycle) newErrors.settlementCycle = "Required";

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
            <h3 className="text-lg font-medium">7. Bank & Settlement Details</h3>
            <p className="text-sm text-muted-foreground">This account will be used for all loan disbursements and settlements.</p>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                        value={formData.bankName}
                        onChange={e => updateForm('bankName', e.target.value)}
                        placeholder="e.g. GTBank, Zenith"
                        className={errors.bankName ? "border-red-500" : ""}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Account Number (NUBAN)</Label>
                    <Input
                        value={formData.accountNumber}
                        onChange={e => updateForm('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                        className={errors.accountNumber ? "border-red-500" : ""}
                    />
                    {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Account Name</Label>
                <Input
                    value={formData.accountName}
                    onChange={e => updateForm('accountName', e.target.value)}
                    placeholder="Must match Legal Business Name"
                    className={errors.accountName ? "border-red-500" : ""}
                />
                <p className="text-[0.8rem] text-muted-foreground">Ensure this matches your CAC Business Name exactly.</p>
                {errors.accountName && <p className="text-xs text-red-500">{errors.accountName}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select
                        value={formData.accountType}
                        onValueChange={val => updateForm('accountType', val)}
                    >
                        <SelectTrigger className={errors.accountType ? "border-red-500" : ""}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Current">Current / Corporate</SelectItem>
                            <SelectItem value="Savings">Savings (Sole Prop Only)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Bank Verification Number (BVN)</Label>
                    <Input
                        value={formData.bankBvn}
                        onChange={e => updateForm('bankBvn', e.target.value.replace(/\D/g, '').slice(0, 11))}
                        maxLength={11}
                        placeholder="Linked to this account"
                        className={errors.bankBvn ? "border-red-500" : ""}
                    />
                    {errors.bankBvn && <p className="text-xs text-red-500">{errors.bankBvn}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Preferred Settlement Schedule</Label>
                <Select
                    value={formData.settlementCycle}
                    onValueChange={val => updateForm('settlementCycle', val)}
                >
                    <SelectTrigger className={errors.settlementCycle ? "border-red-500" : ""}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Instant">Instant (Fees apply)</SelectItem>
                        <SelectItem value="T+1">T+1 (Next Day)</SelectItem>
                        <SelectItem value="T+2">T+2 (Standard)</SelectItem>
                        <SelectItem value="Weekly">Weekly (Fridays)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={handleNext}>Next Step</Button>
            </div>
        </div>
    );
}
