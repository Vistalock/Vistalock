'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Loader2, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
    loanId: string;
    amountDue: number;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function PaymentModal({ loanId, amountDue, open, onClose, onSuccess }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePay = async () => {
        setLoading(true);
        try {
            // Call Repay Endpoint
            // POST /loans/:id/repay { amount: number }
            await api.post(`/loans/${loanId}/repay`, { amount: amountDue });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setLoading(false);
                onSuccess();
                onClose();
            }, 2000); // Show success state for 2s

        } catch (e) {
            console.error('Payment Failed', e);
            alert('Payment execution failed. Try again.');
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Make Payment</DialogTitle>
                    <DialogDescription>
                        Pay <strong>NGN {amountDue}</strong> to unlock your device.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    {success ? (
                        <div className="flex flex-col items-center text-green-600 animate-in zoom-in">
                            <CheckCircle size={64} />
                            <p className="mt-4 font-bold text-lg">Payment Successful!</p>
                        </div>
                    ) : (
                        <div className="w-full space-y-4">
                            <div className="bg-slate-100 p-4 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-slate-500">Total Due</span>
                                <span className="text-xl font-bold">NGN {amountDue}</span>
                            </div>
                            <div className="text-xs text-center text-slate-400">
                                Secured by Paystack (Splitting 100% to Merchant)
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-start">
                    {!success && (
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={handlePay}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Pay Now'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
