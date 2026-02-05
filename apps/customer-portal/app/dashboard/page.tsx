'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { PaymentModal } from '@/components/payment-modal';

export default function DashboardPage() {
    const router = useRouter();
    const [loan, setLoan] = useState<{ id: string; status: string; installments?: Array<{ amountDue: number; amountPaid: number }> } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);

    const loadData = async () => {
        const userId = localStorage.getItem('customer_userId');
        if (!userId) return router.push('/');

        try {
            // Fetch Profile (using generic customer endpoint or specifically by ID if we had it)
            // For MVP, if we don't have a direct /customers/me, we rely on what we have.
            // Actually, auth-service doesn't have /me for customers yet.
            // We will skip strict profile fetch for now and just look for loans.

            // Fetch Loans for this user.
            // The /loans endpoint lists all loans. We need to filter by userId.
            // Or better, /loans?userId=...
            // Ideally API Gateway forwards /loans to loan-service.
            const loanRes = await api.get(`/loans?userId=${userId}`);
            // Assuming the first active loan is the one.
            const activeLoan = loanRes.data.find((l: { status: string }) => l.status === 'ACTIVE' || l.status === 'DEFAULTED');
            setLoan(activeLoan);

        } catch (e) {
            console.error('Fetch Error', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [router, loadData]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    // Calculate Outstanding
    const outstanding = loan?.installments?.reduce((acc: number, inst: { amountDue: number; amountPaid: number }) => {
        return acc + (Number(inst.amountDue) - Number(inst.amountPaid));
    }, 0) || 0;

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">My Loan</h1>
                <Button variant="outline" size="sm" onClick={() => router.push('/')}>Logout</Button>
            </header>

            {!loan ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        No active loans found.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {/* Status Card */}
                    <Card className={`${loan.status === 'DEFAULTED' ? 'border-red-500 bg-red-50' : 'bg-white'}`}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">DEVICE STATUS</CardTitle>
                            <div className="flex items-center justify-between">
                                <span className={`text-2xl font-bold ${loan.status === 'DEFAULTED' ? 'text-red-600' : 'text-green-600'}`}>
                                    {loan.status === 'DEFAULTED' ? 'LOCKED' : 'UNLOCKED'}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${loan.status === 'DEFAULTED' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Loan Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Samsung Galaxy A14</CardTitle>
                            <CardDescription>Loan ID: {loan.id.substring(0, 8)}...</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Total Outstanding</span>
                                <span className="font-bold">NGN {outstanding.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Next Payment</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>

                            <Button
                                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 mt-4"
                                onClick={() => setShowPayment(true)}
                            >
                                Pay Now
                            </Button>
                        </CardContent>
                    </Card>

                    <PaymentModal
                        open={showPayment}
                        onClose={() => setShowPayment(false)}
                        amountDue={5000} // Paying standard installment
                        loanId={loan.id}
                        onSuccess={() => {
                            // Reload data to calculate new balance
                            loadData();
                        }}
                    />
                </div>
            )}
        </div>
    );
}
