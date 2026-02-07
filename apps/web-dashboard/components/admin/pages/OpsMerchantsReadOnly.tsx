/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Calendar, Package, AlertTriangle } from 'lucide-react';
import axios from 'axios';

// Simple status color mapper
const getStatusVariant = (status: string) => {
    switch (status) {
        case 'APPROVED': return 'default';
        case 'PENDING': return 'secondary';
        case 'REJECTED': return 'destructive';
        case 'SUSPENDED': return 'outline';
        default: return 'secondary';
    }
};

export default function OpsMerchantsReadOnlyView() {
    const [merchants, setMerchants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMerchants = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const response = await axios.get(`${apiUrl}/admin/merchants`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMerchants(response.data);
        } catch (error) {
            console.error('Error fetching merchants:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMerchants();
    }, []);

    if (loading) return <div className="p-4">Loading merchants...</div>;

    return (
        <div className="space-y-4 p-4 md:p-6">
            <div className="flex flex-col gap-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Merchant Overview</h1>
                    <p className="text-sm text-muted-foreground">Read-only view of merchant context and status</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Ops Admin: Read-only access. Contact Risk/Compliance team for approvals.</span>
                    </div>
                </div>
            </div>

            {/* Mobile-First Card Layout */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {merchants.map((merchant) => (
                    <Card key={merchant.id} className="relative">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle className="text-lg">{merchant.businessName}</CardTitle>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {merchant.email}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status</span>
                                <Badge variant={getStatusVariant(merchant.status)}>
                                    {merchant.status}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Device Usage</span>
                                <div className="flex items-center gap-1 text-sm">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono">{merchant.usedDevices} / {merchant.maxDevices}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                Joined {new Date(merchant.joinedAt).toLocaleDateString()}
                            </div>

                            {/* Escalation Flags */}
                            {merchant.usedDevices >= merchant.maxDevices && (
                                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Device limit reached - escalate if needed</span>
                                </div>
                            )}
                            {merchant.status === 'PENDING' && (
                                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Pending approval - Risk team action required</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {merchants.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No merchants found</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
