"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function FeatureRequestsAdmin() {
    const { data: requests, isLoading } = useQuery({
        queryKey: ['admin-feature-requests'],
        queryFn: async () => {
            // Simulation
            await new Promise(resolve => setTimeout(resolve, 800));
            return [
                { id: '1', merchant: 'Gadget World', title: 'Custom SMS Gateway', status: 'PENDING', budget: 50000, submittedAt: new Date().toISOString() },
                { id: '2', merchant: 'TechStore Ikeja', title: 'Inventory Sync', status: 'REVIEWING', budget: 150000, submittedAt: new Date(Date.now() - 86400000).toISOString() },
                { id: '3', merchant: 'Mobile Hub', title: 'White-label Domain', status: 'APPROVED', budget: 0, submittedAt: new Date(Date.now() - 172800000).toISOString() },
            ];
        }
    });

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-800",
            REVIEWING: "bg-blue-100 text-blue-800",
            APPROVED: "bg-green-100 text-green-800",
            REJECTED: "bg-red-100 text-red-800",
        };
        return <Badge className={styles[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>;
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Feature Requests</h3>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Merchant</TableHead>
                            <TableHead>Request</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : requests?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No pending requests</TableCell>
                            </TableRow>
                        ) : (
                            requests?.map((req: any) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.merchant}</TableCell>
                                    <TableCell>{req.title}</TableCell>
                                    <TableCell>{req.budget > 0 ? formatCurrency(req.budget) : 'N/A'}</TableCell>
                                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                                    <TableCell>{new Date(req.submittedAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {req.status === 'PENDING' && (
                                            <>
                                                <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
