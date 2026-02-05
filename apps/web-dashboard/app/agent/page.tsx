/* eslint-disable */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

import QRCode from 'react-qr-code';

export default function AgentPage() {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [customer, setCustomer] = useState<any>(null);
    const [kycData, setKycData] = useState<any>(null);
    const [creditResult, setCreditResult] = useState<any>(null);

    // Step 1: Send OTP
    const handleSendOtp = async () => {
        try {
            await api.post('/customers/initiate', { phoneNumber: phone });
            setStep(2);
        } catch (e) {
            console.error('OTP Failed', e);
            alert('Failed to send OTP');
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        try {
            const res = await api.post('/customers/verify', { phoneNumber: phone, code: otp });
            setCustomer(res.data);
            setStep(3);
        } catch (e) {
            console.error('Verify Failed', e);
            alert('Invalid OTP');
        }
    };

    // Step 3: Verify ID (Dojah)
    const [idType, setIdType] = useState<'BVN' | 'NIN'>('BVN');
    const [idValue, setIdValue] = useState('');

    const handleVerifyId = async () => {
        try {
            const res = await api.post('/customers/verify-id', {
                userId: customer.userId,
                type: idType,
                value: idValue
            });
            setKycData(res.data);
            // Auto check credit if qualified
            if (res.data.valid) {
                const bvnToCheck = idType === 'BVN' ? idValue : '12345678901';
                checkCredit(bvnToCheck);
            }
        } catch (e) {
            alert('ID Verification Failed');
        }
    };

    const checkCredit = async (bvn: string) => {
        try {
            const res = await api.post('/customers/credit-check', {
                userId: customer.userId,
                bvn
            });
            setCreditResult(res.data);
            setStep(4);
        } catch (e) {
            alert('Credit Check Error');
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Agent Onboarding Wizard</h1>

            {step === 1 && (
                <Card>
                    <CardHeader><CardTitle>Step 1: Customer Phone</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Label>Phone Number</Label>
                        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="080..." />
                        <Button onClick={handleSendOtp} disabled={!phone}>Send OTP</Button>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <Card>
                    <CardHeader><CardTitle>Step 2: Verify OTP</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Label>Enter Code sent to {phone}</Label>
                        <Input value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" />
                        <Button onClick={handleVerifyOtp}>Verify</Button>
                    </CardContent>
                </Card>
            )}

            {step === 3 && (
                <Card>
                    <CardHeader><CardTitle>Step 3: Identity Verification</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant={idType === 'BVN' ? 'default' : 'outline'} onClick={() => setIdType('BVN')}>BVN</Button>
                            <Button variant={idType === 'NIN' ? 'default' : 'outline'} onClick={() => setIdType('NIN')}>NIN</Button>
                        </div>
                        <Input value={idValue} onChange={e => setIdValue(e.target.value)} placeholder={`Enter ${idType}`} />
                        <Button onClick={handleVerifyId} disabled={idValue.length < 11}>Verify Identity</Button>
                    </CardContent>
                </Card>
            )}

            {step === 4 && (
                <Card>
                    <CardHeader><CardTitle>Step 4: Decision</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            {kycData?.photoUrl && <img src={kycData.photoUrl} alt="Customer" className="w-24 h-24 rounded-full object-cover" />}
                            <div>
                                <h3 className="text-xl font-bold">{kycData?.firstName} {kycData?.lastName}</h3>
                                <p>DOB: {kycData?.dateOfBirth}</p>
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg text-center ${creditResult?.qualified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <h2 className="text-2xl font-bold">{creditResult?.qualified ? 'APPROVED' : 'DECLINED'}</h2>
                            <p>Credit Score: {creditResult?.score}</p>
                        </div>

                        {creditResult?.qualified && (
                            <Button className="w-full" onClick={() => setStep(5)}>
                                Proceed to Device Selection
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {step === 5 && (
                <Card>
                    <CardHeader><CardTitle>Step 5: Device Provisioning</CardTitle></CardHeader>
                    <CardContent className="space-y-6 flex flex-col items-center">
                        <CardDescription>Scan this QR code with the customer's new device to enroll it.</CardDescription>

                        <div className="bg-white p-4 rounded-xl shadow-inner border">
                            <QRCode
                                value={JSON.stringify({
                                    action: "ENROLL",
                                    url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
                                    token: "mock-enrollment-token-12345",
                                    userId: customer.userId
                                })}
                                size={200}
                            />
                        </div>

                        <div className="text-center space-y-2">
                            <p className="font-mono text-sm bg-slate-100 p-2 rounded">Token: mock-enrollment-token-12345</p>
                            <Button variant="outline" onClick={() => alert('Device Enrolled!')}>
                                Simulate "Device Enrolled" Event
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
