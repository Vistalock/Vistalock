
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import { AlertCircle, CheckCircle, XCircle, Eye, MoreVertical, Archive, Trash2 } from 'lucide-react';
import { SudoModal } from '@/components/ui/sudo-modal';
import { CreateMerchantModal } from '@/components/ui/create-merchant-modal';
import { ApplicationDetailsModal } from '@/components/ui/application-details-modal';
import { useToast } from "@/hooks/use-toast";

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [viewModal, setViewModal] = useState<{ isOpen: boolean, app: any | null }>({ isOpen: false, app: null });
    const [createModal, setCreateModal] = useState<{ isOpen: boolean, applicationId: string | null }>({ isOpen: false, applicationId: null });
    const [isSudoOpen, setIsSudoOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'soft' | 'hard' | null; app: any }>({ open: false, type: null, app: null });

    // Action state
    const [action, setAction] = useState<{ id: string, type: 'APPROVE' | 'REJECT' | 'REVIEW_OPS' | 'REVIEW_RISK' } | null>(null);
    const { toast } = useToast();

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await axios.get(`${apiUrl}/admin/merchant-applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleAction = (id: string, type: 'APPROVE' | 'REJECT' | 'REVIEW_OPS' | 'REVIEW_RISK') => {
        setAction({ id, type });
        setIsSudoOpen(true);
    };

    const handleView = (app: any) => {
        setViewModal({ isOpen: true, app });
    };

    const handleCreateAccount = (id: string) => {
        setCreateModal({ isOpen: true, applicationId: id });
    };

    const openDeleteDialog = (type: 'soft' | 'hard', app: any) => {
        setDeleteDialog({ open: true, type, app });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.app || !deleteDialog.type) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const url = deleteDialog.type === 'soft'
                ? `${apiUrl}/admin/merchant-applications/${deleteDialog.app.id}/archive`
                : `${apiUrl}/admin/merchant-applications/${deleteDialog.app.id}`;

            const method = deleteDialog.type === 'soft' ? 'patch' : 'delete';

            await axios[method](url, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast({
                title: "Success",
                description: deleteDialog.type === 'soft'
                    ? "Application archived successfully"
                    : "Application deleted permanently"
            });
            fetchApplications();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete application",
                variant: "destructive"
            });
        } finally {
            setDeleteDialog({ open: false, type: null, app: null });
        }
    };

    const handleSudoSuccess = async (sudoToken: string) => {
        if (!action) return;

        try {
            const token = localStorage.getItem('token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'X-Sudo-Token': sudoToken
            };

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const url = `${apiUrl}/admin/merchant-applications/${action.id}/${action.type.toLowerCase()}`;
            const body = action.type === 'REJECT' ? { reason: 'Admin Rejected' } : {};

            await axios.post(url, body, { headers });

            fetchApplications();
        } catch (err) {
            console.error(err);
            alert('Operation failed');
        } finally {
            setAction(null);
        }
    };

    if (loading) return <div>Loading applications...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Merchant Applications</CardTitle>
                    <CardDescription>Review and approve incoming merchant requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Business</th>
                                    <th className="px-4 py-3 font-medium">Contact</th>
                                    <th className="px-4 py-3 font-medium">Volume</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-muted-foreground">No pending applications.</td>
                                    </tr>
                                )}
                                {applications.map((app) => (
                                    <tr key={app.id} className="border-t hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{app.businessName}</div>
                                            <div className="text-xs text-muted-foreground">{app.email}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>{app.contactName}</div>
                                            <div className="text-xs text-muted-foreground">{app.phone}</div>
                                        </td>
                                        <td className="px-4 py-3">{app.monthlyVolume || 'N/A'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={app.status === 'PENDING' ? 'outline' : app.status === 'APPROVED' ? 'default' : 'destructive'}>
                                                {app.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                <Button size="icon" variant="ghost" title="View Details" onClick={() => handleView(app)}>
                                                    <Eye className="h-4 w-4 text-blue-600" />
                                                </Button>

                                                {app.status === 'PENDING' && (
                                                    <Button size="sm" variant="outline" className="h-8 text-xs bg-yellow-50 text-yellow-700 border-yellow-200" onClick={() => handleAction(app.id, 'REVIEW_OPS')}>
                                                        Ops Review
                                                    </Button>
                                                )}

                                                {app.status === 'OPS_REVIEWED' && (
                                                    <Button size="sm" variant="outline" className="h-8 text-xs bg-orange-50 text-orange-700 border-orange-200" onClick={() => handleAction(app.id, 'REVIEW_RISK')}>
                                                        Risk Review
                                                    </Button>
                                                )}

                                                {app.status === 'RISK_REVIEWED' && (
                                                    <Button size="sm" variant="outline" className="h-8 text-xs bg-green-50 text-green-700 border-green-200" onClick={() => handleAction(app.id, 'APPROVE')}>
                                                        Final Approve
                                                    </Button>
                                                )}

                                                {app.status !== 'APPROVED' && app.status !== 'REJECTED' && (
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleAction(app.id, 'REJECT')}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                {app.status === 'APPROVED' && (
                                                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleCreateAccount(app.id)}>
                                                        Create Account
                                                    </Button>
                                                )}

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openDeleteDialog('soft', app)}>
                                                            <Archive className="mr-2 h-4 w-4" />
                                                            Archive
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => openDeleteDialog('hard', app)}
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

            <SudoModal
                isOpen={isSudoOpen}
                onClose={() => setIsSudoOpen(false)}
                onSuccess={handleSudoSuccess}
            />

            <CreateMerchantModal
                isOpen={createModal.isOpen}
                onClose={() => setCreateModal({ ...createModal, isOpen: false })}
                onSuccess={() => {
                    fetchApplications(); // Refresh list
                }}
                applicationId={createModal.applicationId}
            />

            <ApplicationDetailsModal
                isOpen={viewModal.isOpen}
                onClose={() => setViewModal({ isOpen: false, app: null })}
                application={viewModal.app}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: null, app: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {deleteDialog.type === 'soft' ? 'Archive Application?' : '⚠️ Delete Permanently?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteDialog.type === 'soft'
                                ? `This will hide "${deleteDialog.app?.businessName}" from the list. You can restore it later if needed.`
                                : `This will permanently delete "${deleteDialog.app?.businessName}" and cannot be undone. Are you absolutely sure?`
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
        </div>
    );
}
