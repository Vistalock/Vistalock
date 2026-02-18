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
import { Search, Filter, ShieldAlert } from "lucide-react";
import { useState } from "react";

// Mock data
const MOCK_DISPUTES = [
    { id: 'DSP-001', loanId: 'LN-1024', customer: 'John Doe', reason: 'Double Debited', status: 'OPEN', date: '2025-05-12' },
    { id: 'DSP-002', loanId: 'LN-1099', customer: 'Jane Smith', reason: 'Device Locked Error', status: 'RESOLVED', date: '2025-05-10' },
];

export default function DisputesPage() {
    const [search, setSearch] = useState("");

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Disputes & Appeals</h1>
                    <p className="text-sm text-gray-500">Manage customer complaints and override requests</p>
                </div>
            </div>

            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search by Dispute ID or Loan ID..."
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
                                <TableHead>Dispute ID</TableHead>
                                <TableHead>Loan ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_DISPUTES.map((dispute) => (
                                <TableRow key={dispute.id}>
                                    <TableCell className="font-medium">{dispute.id}</TableCell>
                                    <TableCell className="font-mono text-xs">{dispute.loanId}</TableCell>
                                    <TableCell>{dispute.customer}</TableCell>
                                    <TableCell>{dispute.reason}</TableCell>
                                    <TableCell>
                                        <Badge variant={dispute.status === 'OPEN' ? 'destructive' : 'secondary'}>
                                            {dispute.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{dispute.date}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline">View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
