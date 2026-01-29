'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Archive, Trash2 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

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
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'soft' | 'hard' | null; merchant: any }>({ open: false, type: null, merchant: null });
    const { toast } = useToast();

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

    const openDeleteDialog = (type: 'soft' | 'hard', merchant: any) => {
        setDeleteDialog({ open: true, type, merchant });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.merchant || !deleteDialog.type) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

            // For merchants (MerchantProfile), we need different endpoints
            const url = deleteDialog.type === 'soft'
                ? `${apiUrl}/admin/merchants/${deleteDialog.merchant.id}/archive`
                : `${apiUrl}/admin/merchants/${deleteDialog.merchant.id}`;

            const method = deleteDialog.type === 'soft' ? 'patch' : 'delete';

            await axios[method](url, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast({
                title: "Success",
                description: deleteDialog.type === 'soft'
                    ? "Merchant archived successfully"
                    : "Merchant deleted permanently"
            });
            fetchMerchants();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete merchant",
                variant: "destructive"
            });
        } finally {
            setDeleteDialog({ open: false, type: null, merchant: null });
        }
    };

    if (loading) return <div>Loading merchants...</div>;

    return (
        <>
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

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openDeleteDialog('soft', merchant)}>
                                                            <Archive className="mr-2 h-4 w-4" />
                                                            Archive
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => openDeleteDialog('hard', merchant)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Permanently
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open: boolean) => !open && setDeleteDialog({ open: false, type: null, merchant: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {deleteDialog.type === 'soft' ? 'Archive Merchant?' : '⚠️ Delete Permanently?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteDialog.type === 'soft'
                                ? `This will hide "${deleteDialog.merchant?.businessName}" from the list. You can restore it later if needed.`
                                : `This will permanently delete "${deleteDialog.merchant?.businessName}" and all associated data. This cannot be undone. Are you absolutely sure?`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className={deleteDialog.type === 'hard' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            {deleteDialog.type === 'soft' ? 'Archive' : 'Delete Permanently'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
