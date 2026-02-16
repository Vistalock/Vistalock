"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    Smartphone,
    User,
    AlertTriangle,
    CheckCircle,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { RecordPaymentModal } from "@/components/loans/record-payment-modal";

// Helper for status badge style
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'ACTIVE':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
        case 'PENDING':
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
        case 'COMPLETED':
            return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>;
        case 'DEFAULTED':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Defaulted</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function LoanDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const loanId = params.id as string;

    const { data: loan, isLoading, error } = useQuery({
        queryKey: ['loan', loanId],
        queryFn: async () => {
            // In a real app, this would be a specific getById endpoint
            // For now, filtering from the list or assuming backend supports /loans/:id
            // Let's assume the backend endpoint exists as discussed in the plan
            // If not, we might need to fetch all and find (less efficient)
            try {
                // Trying specific endpoint first
                const res = await api.get(`/loan-partner-api/loans/${loanId}`);
                console.log(res);
                return res.data;
            } catch (e) {
                // Fallback to list and find (temporary)
                const res = await api.get('/loan-partner-api/loans');
                return res.data.find((l: any) => l.id === loanId);
            }
        },
        enabled: !!loanId
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!loan) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
                <h2 className="text-xl font-semibold">Loan Not Found</h2>
                <Button variant="outline" onClick={() => router.push('/loans')}>
                    Back to Loans
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/loans">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Loan Details</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>ID: {loan.id}</span>
                        <span>•</span>
                        <span>{new Date(loan.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="ml-auto">
                    {getStatusBadge(loan.status)}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Customer Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Customer Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Full Name</div>
                                <div>{loan.customer?.firstName} {loan.customer?.lastName}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Email</div>
                                <div>{loan.customer?.email}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Phone</div>
                                <div>{loan.customer?.phone || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Address</div>
                                <div className="truncate">{loan.customer?.address || 'N/A'}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Device Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5" />
                            Device Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Product</div>
                                <div>{loan.product?.name || 'Unknown'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">IMEI</div>
                                <div className="font-mono">{loan.deviceIMEI}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Model</div>
                                <div>{loan.product?.model || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Lock Status</div>
                                {/* Assuming we might fetch fresh device status or use what's in loan */}
                                <Badge variant="outline">
                                    {/* Placeholder for actual device lock status if available in loan object */}
                                    Unknown
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Details */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Financial Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Loan Amount</div>
                                <div className="text-lg font-bold">{formatCurrency(loan.loanAmount)}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Outst. Balance</div>
                                <div className="text-lg font-bold text-red-600">{formatCurrency(loan.outstandingAmount)}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Total Repayment</div>
                                <div className="text-lg font-bold">{formatCurrency(loan.totalRepayment)}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Monthly Payment</div>
                                <div className="text-lg font-bold">{formatCurrency(loan.monthlyRepayment)}</div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Repayment History Placeholder */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Repayment History</h3>
                                <RecordPaymentModal
                                    loanId={loanId}
                                    onSuccess={() => {
                                        // In a real app we'd refetch: queryClient.invalidateQueries(['loan', loanId])
                                        window.location.reload();
                                    }}
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                                                No repayment history available.
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Mark Defaulted
                </Button>
                <Button variant="outline">
                    <XCircle className="mr-2 h-4 w-4" />
                    Close Loan
                </Button>
            </div>
        </div>
    );
}
