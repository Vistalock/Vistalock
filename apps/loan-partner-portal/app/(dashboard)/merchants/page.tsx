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
import { Search, Filter, Store } from "lucide-react";
import { useState } from "react";

// Mock data for Phase 1
const MOCK_MERCHANTS = [
    { id: '1', name: 'Gadget World', status: 'ACTIVE', riskScore: 'Low', activeLoans: 12, totalDisbursed: 450000 },
    { id: '2', name: 'Tech Point', status: 'ACTIVE', riskScore: 'Medium', activeLoans: 5, totalDisbursed: 120000 },
    { id: '3', name: 'Mobile Hub', status: 'SUSPENDED', riskScore: 'High', activeLoans: 0, totalDisbursed: 0 },
];

export default function MerchantsPage() {
    const [search, setSearch] = useState("");

    const filteredMerchants = MOCK_MERCHANTS.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase())
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
                            {filteredMerchants.map((merchant) => (
                                <TableRow key={merchant.id}>
                                    <TableCell className="font-medium">{merchant.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={merchant.status === 'ACTIVE' ? 'default' : 'destructive'}>
                                            {merchant.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{merchant.riskScore}</TableCell>
                                    <TableCell className="text-right">{merchant.activeLoans}</TableCell>
                                    <TableCell className="text-right">₦{merchant.totalDisbursed.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
