'use client';

import { useState, useEffect } from 'react';
import { getPartnerCommissions } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchCommissions = async () => {
        setIsLoading(true);
        try {
            const data = await getPartnerCommissions();
            setCommissions(data);
        } catch (error) {
            console.error('Failed to fetch commissions:', error);
            // toast({
            //     title: "Error",
            //     description: "Failed to load commissions.",
            //     variant: "destructive",
            // });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Agent Commissions</CardTitle>
                        <CardDescription>Track earnings for agents based on approved loan sales.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : commissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground mb-2">No commission records found</p>
                            <Button variant="outline" onClick={fetchCommissions}>Refresh</Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Agent</TableHead>
                                    <TableHead>Merchant</TableHead>
                                    <TableHead>Loan Amount</TableHead>
                                    <TableHead>Commission (1%)</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {commissions.map((comm) => (
                                    <TableRow key={comm.id}>
                                        <TableCell>{new Date(comm.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-medium">{comm.agentName}</TableCell>
                                        <TableCell>{comm.merchantName}</TableCell>
                                        <TableCell>{formatCurrency(comm.loanAmount)}</TableCell>
                                        <TableCell className="text-green-600 font-semibold">{formatCurrency(comm.commissionAmount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={comm.status === 'PAID' ? 'default' : 'secondary'}>
                                                {comm.status}
                                            </Badge>
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
