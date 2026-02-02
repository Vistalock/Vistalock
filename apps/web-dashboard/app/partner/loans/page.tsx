'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Assuming this exists, or I implement it inline

interface Loan {
    id: string;
    createdAt: string;
    status: 'ACTIVE' | 'PENDING' | 'DEFAULTED' | 'COMPLETED' | 'LOCKED';
    loanAmount: number;
    outstandingAmount: number;
    totalRepayment: number;
    isLocked: boolean;
    device: {
        model: string;
        imei: string;
    };
    user: {
        customerProfile: {
            firstName: string;
            lastName: string;
        } | null;
    };
    merchant: {
        merchantProfile: {
            businessName: string;
        } | null;
    };
}

export default function PartnerLoans() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const res = await api.get('/loan-partners/loans');
                setLoans(res.data);
            } catch (error) {
                console.error('Failed to fetch loans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, []);

    const filteredLoans = loans.filter(loan =>
        loan.user.customerProfile?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.user.customerProfile?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.device.imei.includes(searchTerm)
    );

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Loan Portfolio</h1>
                <p className="text-muted-foreground">Monitor active loans and repayment performance</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Loans</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search customer or IMEI"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading portfolio...</div>
                    ) : loans.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No loans found for this partner account.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Device</TableHead>
                                    <TableHead>Principal</TableHead>
                                    <TableHead>Outstanding</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Lock State</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLoans.map((loan) => (
                                    <TableRow key={loan.id}>
                                        <TableCell>
                                            {new Date(loan.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {loan.user.customerProfile?.firstName} {loan.user.customerProfile?.lastName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Via: {loan.merchant.merchantProfile?.businessName || 'Unknown Merchant'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{loan.device.model || 'Generic Device'}</span>
                                                <span className="text-xs text-muted-foreground font-mono">{loan.device.imei}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatMoney(loan.loanAmount)}</TableCell>
                                        <TableCell className={loan.outstandingAmount > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                                            {formatMoney(loan.outstandingAmount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                loan.status === 'ACTIVE' ? 'default' :
                                                    loan.status === 'COMPLETED' ? 'secondary' :
                                                        loan.status === 'DEFAULTED' ? 'destructive' : 'outline'
                                            }>
                                                {loan.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {loan.isLocked ? (
                                                <Badge variant="destructive" className="flex w-fit gap-1">
                                                    Locked
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                    Unlocked
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
