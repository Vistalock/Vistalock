"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, Filter } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

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

export default function LoansPage() {
    const [search, setSearch] = useState("");

    const { data: loans, isLoading, error } = useQuery({
        queryKey: ['loans'],
        queryFn: async () => {
            const res = await api.get('/loan-partner-api/loans');
            return res.data;
        }
    });

    const filteredLoans = loans?.filter((loan: any) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            loan.customer?.firstName.toLowerCase().includes(searchLower) ||
            loan.customer?.lastName.toLowerCase().includes(searchLower) ||
            loan.deviceIMEI.includes(searchLower) ||
            loan.id.includes(searchLower)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Loans</h1>
                    <p className="text-sm text-gray-500">Manage your active loan portfolio</p>
                </div>
                {/* <Button>Export CSV</Button> */}
            </div>

            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search by customer, IMEI, or Loan ID..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="sm:w-auto">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Device</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><div className="h-4 w-32 bg-gray-100 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-gray-100 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-gray-100 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-6 w-20 bg-gray-100 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-gray-100 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-8 w-8 bg-gray-100 rounded animate-pulse ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredLoans?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                            No loans found matching your criteria
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLoans?.map((loan: any) => (
                                        <TableRow key={loan.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {loan.customer?.firstName} {loan.customer?.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">{loan.customer?.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{loan.product?.name || 'Unknown Device'}</div>
                                                <div className="text-xs text-gray-500 font-mono">{loan.deviceIMEI}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{formatCurrency(loan.loanAmount)}</div>
                                                <div className="text-xs text-gray-500">
                                                    Bal: {formatCurrency(loan.outstandingAmount)}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(loan.status)}</TableCell>
                                            <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/loans/${loan.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
