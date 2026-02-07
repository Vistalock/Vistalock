/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { MoreVertical, Archive, Trash2, Building2, Mail, Calendar, Package } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

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

export default function MerchantsPage() {
    const [merchants, setMerchants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'soft' | 'hard' | null; merchant: any }>({ open: false, type: null, merchant: null });
    const { toast } = useToast();

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

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            await axios.patch(`${apiUrl}/admin/merchants/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMerchants();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    const handleLimitUpdate = async (id: string, currentLimit: number) => {
        const newLimit = prompt(`Enter new device limit (current: ${currentLimit}):`, String(currentLimit));
        if (!newLimit) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            await axios.patch(`${apiUrl}/admin/merchants/${id}/limits`, { maxDevices: Number(newLimit) }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMerchants();
        } catch (error) {
            console.error('Error updating limits:', error);
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

            const url = deleteDialog.type === 'soft'
                ? `${apiUrl}/admin/merchants/${deleteDialog.merchant.id}/archive`
                : `${apiUrl}/admin/merchants/${deleteDialog.merchant.id}`;

            const method = deleteDialog.type === 'soft' ? 'patch' : 'delete';


            if (deleteDialog.type === 'soft') {
                await axios.patch(url, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.delete(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

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

    if (loading) return <div className="p-4">Loading merchants...</div>;

    return (
        <>
            <div className="space-y-4 p-4 md:p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Merchant Management</h1>
                        <p className="text-sm text-muted-foreground">View, approve, and manage merchant accounts.</p>
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
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {merchant.status === 'PENDING' && (
                                        <>
                                            <Button
                                                onClick={() => handleStatusUpdate(merchant.id, 'APPROVED')}
                                                size="sm"
                                                className="flex-1"
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => handleStatusUpdate(merchant.id, 'REJECTED')}
                                                size="sm"
                                                variant="destructive"
                                                className="flex-1"
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                    {merchant.status === 'APPROVED' && (
                                        <Button
                                            onClick={() => handleLimitUpdate(merchant.id, merchant.maxDevices)}
                                            size="sm"
                                            variant="outline"
                                            className="w-full"
                                        >
                                            Set Device Limit
                                        </Button>
                                    )}
                                </div>
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
