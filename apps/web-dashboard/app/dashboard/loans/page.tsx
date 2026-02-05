/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { jwtDecode } from 'jwt-decode'; // Fix import
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function StatusBadge({ status }: { status: string }) {
    const styles = {
        ACTIVE: 'bg-green-100 text-green-800',
        PENDING: 'bg-yellow-100 text-yellow-800',
        COMPLETED: 'bg-blue-100 text-blue-800',
        DEFAULTED: 'bg-red-100 text-red-800',
    };
    const className = styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}>
            {status}
        </span>
    );
}

export default function LoansPage() {
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded: any = jwtDecode(token);
                // decoded.sub is the user ID. For merchants, this is their merchantId/userId.
                const merchantId = decoded.sub;

                const res = await api.get(`/loans?merchantId=${merchantId}`);
                setLoans(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch loans', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Loan Management</h1>
                <Button onClick={() => fetchLoans()}>Refresh</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Loans</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4">Loading loans...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Loan ID</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Interest</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Start Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loans.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center md:text-left text-muted-foreground py-8">
                                            No loans found for this merchant.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {loans.map((loan) => (
                                    <TableRow key={loan.id}>
                                        <TableCell className="font-mono text-xs">{loan.id.substring(0, 8)}...</TableCell>
                                        <TableCell>₦{Number(loan.amount).toLocaleString()}</TableCell>
                                        <TableCell>{Number(loan.interestRate)}%</TableCell>
                                        <TableCell>{loan.durationMonths} months</TableCell>
                                        <TableCell>
                                            <StatusBadge status={loan.status} />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(loan.startDate).toLocaleDateString()}
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
