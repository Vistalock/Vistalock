"use client";

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
import { Search, Filter, Store, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";

export default function MerchantsPage() {
    // I should fix the controller to derive it from the USER, but for now I'll use a dummy ID.
    const PARTNER_ID = "4ac9f212-46d5-4602-b8d6-797c95c1179d";
    const [search, setSearch] = useState("");

    const { data: merchants, isLoading } = useQuery({
        queryKey: ['partner-merchants'],
        queryFn: async () => {
            const res = await api.get(`/loan-partner-api/merchants?partnerId=${PARTNER_ID}`);
            return res.data;
        }
    });

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    const filteredMerchants = (merchants || []).filter((m: any) =>
        m.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Merchants</h1>
                    <p className="text-sm text-gray-500">Monitor merchant performance and risk</p>
                </div>
                <Button>
                    <Store className="mr-2 h-4 w-4" />
                    Add Merchant
                </Button>
            </div>

            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search merchants..."
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Merchant Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Risk Score</TableHead>
                                <TableHead className="text-right">Active Loans</TableHead>
                                <TableHead className="text-right">Total Disbursed</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMerchants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No merchants found.
                                    </TableCell>
                                </TableRow>
                            ) : filteredMerchants.map((merchant: any) => (
                                <TableRow key={merchant.id}>
                                    <TableCell className="font-medium">{merchant.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={merchant.status === 'APPROVED' || merchant.status === 'ACTIVE' ? 'default' : 'destructive'}>
                                            {merchant.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{merchant.riskScore}</TableCell>
                                    <TableCell className="text-right">{merchant.activeLoans}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(merchant.totalDisbursed)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
