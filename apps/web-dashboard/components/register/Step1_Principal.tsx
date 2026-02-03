
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import { StepProps } from './types';
import { FileUploader } from './FileUploader';

export default function Step1_Principal({ formData, updateForm, onNext }: StepProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        // Account
        if (!formData.email) newErrors.email = "Email is required";
        if (formData.password) {
            if (formData.password.length < 8) newErrors.password = "Password must be at least 8 chars";
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        } else {
            newErrors.password = "Password is required";
        }

        // Principal
        if (!formData.directorName) newErrors.directorName = "Full Name is required";
        if (!formData.directorPhone || formData.directorPhone.length !== 11) newErrors.directorPhone = "Phone must be 11 digits";

        // Validate ONLY the selected verification type
        if (formData.verificationType === 'NIN') {
            if (!formData.directorNin || formData.directorNin.length !== 11) {
                newErrors.directorNin = "NIN must be 11 digits";
            }
        } else if (formData.verificationType === 'BVN') {
            if (!formData.directorBvn || formData.directorBvn.length !== 11) {
                newErrors.directorBvn = "BVN must be 11 digits";
            }
        }

        if (!formData.directorDob) newErrors.directorDob = "Date of Birth is required";
        if (!formData.directorAddress) newErrors.directorAddress = "Residential Address is required";

        // Files
        if (!formData.directorIdFile) newErrors.directorIdFile = "Govt ID upload is required";
        if (!formData.directorPassportFile) newErrors.directorPassportFile = "Passport Photo upload is required";

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
            <div className="space-y-4">
                <h3 className="text-lg font-medium">1. Account Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={e => updateForm('email', e.target.value)}
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={e => updateForm('password', e.target.value)}
                                className={errors.password ? "border-red-500" : ""}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Confirm Password</Label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={e => updateForm('confirmPassword', e.target.value)}
                                className={errors.confirmPassword ? "border-red-500" : ""}
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">2. Principal / Director KYC</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Full Legal Name</Label>
                        <Input
                            value={formData.directorName}
                            onChange={e => updateForm('directorName', e.target.value)}
                            className={errors.directorName ? "border-red-500" : ""}
                        />
                        {errors.directorName && <p className="text-xs text-red-500">{errors.directorName}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                            value={formData.directorRole}
                            onValueChange={val => updateForm('directorRole', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Owner">Owner</SelectItem>
                                <SelectItem value="Director">Director</SelectItem>
                                <SelectItem value="Partner">Partner</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                            value={formData.directorPhone}
                            onChange={e => updateForm('directorPhone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                            maxLength={11}
                            placeholder="08012345678"
                            className={errors.directorPhone ? "border-red-500" : ""}
                        />
                        {errors.directorPhone && <p className="text-xs text-red-500">{errors.directorPhone}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input
                            type="date"
                            value={formData.directorDob}
                            onChange={e => updateForm('directorDob', e.target.value)}
                            className={errors.directorDob ? "border-red-500" : ""}
                        />
                        {errors.directorDob && <p className="text-xs text-red-500">{errors.directorDob}</p>}
                    </div>
                </div>

                {/* Identity Verification Choice */}
                <div className="space-y-4 pt-2 border-t">
                    <div className="space-y-2">
                        <Label>Identity Verification Method *</Label>
                        <p className="text-xs text-muted-foreground">Choose one verification method</p>
                        <div className="flex gap-6 pt-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="nin"
                                    name="verificationType"
                                    value="NIN"
                                    checked={formData.verificationType === 'NIN'}
                                    onChange={(e) => updateForm('verificationType', e.target.value)}
                                    className="h-4 w-4 text-primary"
                                />
                                <label htmlFor="nin" className="text-sm font-medium cursor-pointer">
                                    National Identity Number (NIN)
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="bvn"
                                    name="verificationType"
                                    value="BVN"
                                    checked={formData.verificationType === 'BVN'}
                                    onChange={(e) => updateForm('verificationType', e.target.value)}
                                    className="h-4 w-4 text-primary"
                                />
                                <label htmlFor="bvn" className="text-sm font-medium cursor-pointer">
                                    Bank Verification Number (BVN)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Conditional NIN Field */}
                    {formData.verificationType === 'NIN' && (
                        <div className="space-y-2">
                            <Label>NIN (11 Digits) *</Label>
                            <Input
                                value={formData.directorNin}
                                onChange={e => updateForm('directorNin', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                maxLength={11}
                                placeholder="12345678901"
                                className={errors.directorNin ? "border-red-500" : ""}
                            />
                            {errors.directorNin && <p className="text-xs text-red-500">{errors.directorNin}</p>}
                        </div>
                    )}

                    {/* Conditional BVN Field */}
                    {formData.verificationType === 'BVN' && (
                        <div className="space-y-2">
                            <Label>BVN (11 Digits) *</Label>
                            <Input
                                value={formData.directorBvn}
                                onChange={e => updateForm('directorBvn', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                maxLength={11}
                                placeholder="22334455667"
                                className={errors.directorBvn ? "border-red-500" : ""}
                            />
                            {errors.directorBvn && <p className="text-xs text-red-500">{errors.directorBvn}</p>}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Residential Address</Label>
                    <Input
                        value={formData.directorAddress}
                        onChange={e => updateForm('directorAddress', e.target.value)}
                        placeholder="House No, Street, City"
                        className={errors.directorAddress ? "border-red-500" : ""}
                    />
                    {errors.directorAddress && <p className="text-xs text-red-500">{errors.directorAddress}</p>}
                </div>

                <div className="grid gap-8 sm:grid-cols-2 pt-2">
                    <div className="space-y-2">
                        <FileUploader
                            label="Recent Passport Photo"
                            fileUrl={formData.directorPassportFile}
                            onFileChange={val => updateForm('directorPassportFile', val)}
                            required
                        />
                        {errors.directorPassportFile && <p className="text-xs text-red-500">{errors.directorPassportFile}</p>}
                    </div>
                    <div className="space-y-2">
                        <FileUploader
                            label="Valid Govt ID (NIN/Passport/DL)"
                            fileUrl={formData.directorIdFile}
                            onFileChange={val => updateForm('directorIdFile', val)}
                            required
                        />
                        {errors.directorIdFile && <p className="text-xs text-red-500">{errors.directorIdFile}</p>}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={handleNext}>Next Step</Button>
            </div>
        </div>
    );
}
