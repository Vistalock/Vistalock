'use client';

import { useState, useEffect } from 'react';
import { getPartnerApplications, processLoanDecision } from '@/lib/api';
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
import { Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const data = await getPartnerApplications();
            setApplications(data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            toast({
                title: "Error",
                description: "Failed to load loan applications.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleDecision = async (loanId: string, decision: 'APPROVE' | 'REJECT') => {
        setProcessingId(loanId);
        try {
            await processLoanDecision(loanId, decision);
            toast({
                title: decision === 'APPROVE' ? "Loan Approved" : "Loan Rejected",
                description: `The loan application has been ${decision.toLowerCase()}d.`,
            });
            // Refresh list
            fetchApplications();
        } catch (error) {
            console.error('Failed to process decision:', error);
            toast({
                title: "Error",
                description: "Failed to process request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Loan Applications</CardTitle>
                    <CardDescription>Review and approve incoming financing requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground mb-2">No pending applications</p>
                            <Button variant="outline" onClick={fetchApplications}>Refresh</Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Borrower</TableHead>
                                    <TableHead>Merchant</TableHead>
                                    <TableHead>Device</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {app.user?.customerProfile?.firstName} {app.user?.customerProfile?.lastName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{app.customerPhone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{app.merchant?.merchantProfile?.businessName || 'Unknown'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{app.device?.model || 'Unknown Device'}</span>
                                                <span className="text-xs text-muted-foreground">IMEI: {app.deviceIMEI}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>₦{app.loanAmount?.toLocaleString()}</TableCell>
                                        <TableCell>{app.tenure} Months</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                    onClick={() => handleDecision(app.id, 'APPROVE')}
                                                    disabled={!!processingId}
                                                >
                                                    {processingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                    <span className="sr-only">Approve</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                    onClick={() => handleDecision(app.id, 'REJECT')}
                                                    disabled={!!processingId}
                                                >
                                                    {processingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                                    <span className="sr-only">Reject</span>
                                                </Button>
                                            </div>
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
