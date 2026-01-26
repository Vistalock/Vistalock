'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import Link from 'next/link';

// Simple status color mapper
const getStatusVariant = (status: string) => {
    switch (status) {
        case 'APPROVED': return 'default'; // primary/green usually
        case 'PENDING': return 'secondary'; // yellow-ish usually
        case 'REJECTED':
        case 'SUSPENDED': return 'destructive';
        default: return 'outline';
    }
};

export default function MerchantsPage() {
    const [merchants, setMerchants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMerchants = async () => {
        try {
            const token = localStorage.getItem('token');
            // Using port 3005 (Gateway)
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin/merchants`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMerchants(res.data);
        } catch (error) {
            console.error("Failed to fetch merchants", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchants();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin/merchants/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMerchants(); // Refresh
        } catch (e) {
            alert('Failed to update status');
        }
    };

    const handleLimitUpdate = async (id: string, currentLimit: number) => {
        const newLimit = prompt("Enter new Max Device Limit:", currentLimit.toString());
        if (!newLimit) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin/merchants/${id}/limits`, { maxDevices: parseInt(newLimit) }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMerchants(); // Refresh
        } catch (e) {
            alert('Failed to update limit');
        }
    }

    if (loading) return <div>Loading merchants...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Merchant Management</CardTitle>
                <CardDescription>View, approve, and manage merchant accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Business Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Join Date</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Usage</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {merchants.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-muted-foreground">No merchants found.</td>
                                </tr>
                            )}
                            {Array.isArray(merchants) && merchants.map((merchant) => (
                                <tr key={merchant.id} className="border-t hover:bg-muted/50">
                                    <td className="px-4 py-3 font-medium">{merchant.businessName}</td>
                                    <td className="px-4 py-3">{merchant.email}</td>
                                    <td className="px-4 py-3">{new Date(merchant.joinedAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={getStatusVariant(merchant.status)}>
                                            {merchant.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        {merchant.usedDevices} / {merchant.maxDevices} Devices
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {merchant.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(merchant.id, 'APPROVED')}
                                                        className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(merchant.id, 'REJECTED')}
                                                        className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {merchant.status === 'APPROVED' && (
                                                <button
                                                    onClick={() => handleLimitUpdate(merchant.id, merchant.maxDevices)}
                                                    className="text-xs border px-2 py-1 rounded hover:bg-muted"
                                                >
                                                    Set Limit
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
