
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Eye, MoreVertical, Archive, Trash2, Trash } from 'lucide-react';
import { SudoModal } from '@/components/ui/sudo-modal';
import { CreateMerchantModal } from '@/components/ui/create-merchant-modal';
import { ApplicationReviewModal } from '@/components/admin/ApplicationReviewModal';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null); // NEW: Track current user
    const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

    // Modals state
    const [reviewModal, setReviewModal] = useState<{ isOpen: boolean, app: any | null }>({ isOpen: false, app: null });
    const [createModal, setCreateModal] = useState<{ isOpen: boolean, applicationId: string | null }>({ isOpen: false, applicationId: null });
    const [isSudoOpen, setIsSudoOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'soft' | 'hard' | null; app: any }>({ open: false, type: null, app: null });

    // Action state
    const [action, setAction] = useState<{ id: string, type: 'APPROVE' | 'REJECT' | 'REVIEW_OPS' | 'REVIEW_RISK' | 'AUTO_ASSESS' } | null>(null);
    const [reviewData, setReviewData] = useState<any>(null);
    const [autoAssessing, setAutoAssessing] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await axios.get(`${apiUrl}/admin/merchant-applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(res.data);

            // NEW: Fetch current user profile to determine role
            const profileRes = await axios.get(`${apiUrl}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(profileRes.data);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const openReview = (app: any) => {
        setReviewModal({ isOpen: true, app });
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

            if (deleteDialog.type === 'soft') {
                await axios.patch(url, {}, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
            }

            toast({
                title: "Success",
                description: deleteDialog.type === 'soft' ? "Application archived" : "Application deleted"
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

    // NEW: Bulk delete handler
    const handleBulkDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

            // Delete all selected applications
            await Promise.all(
                selectedIds.map(id =>
                    axios.delete(`${apiUrl}/admin/merchant-applications/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )
            );

            toast({
                title: "Success",
                description: `${selectedIds.length} application(s) deleted`
            });
            setSelectedIds([]);
            fetchApplications();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete applications",
                variant: "destructive"
            });
        } finally {
            setBulkDeleteDialog(false);
        }
    };

    // NEW: Toggle selection
    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // NEW: Toggle all
    const toggleAll = () => {
        if (selectedIds.length === applications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(applications.map(app => app.id));
        }
    };

    // Triggered from ReviewModal
    const submitReview = (actionType: 'APPROVE' | 'REJECT', data?: any) => {
        if (!reviewModal.app) return;
        setReviewData(data); // Store checklist data

        // Determine backend action type
        let backendAction: 'REVIEW_OPS' | 'REVIEW_RISK' | 'APPROVE' | 'REJECT' = 'REJECT';

        if (actionType === 'REJECT') {
            backendAction = 'REJECT';
        } else {
            // Processing Approvals based on stage
            if (reviewModal.app.status === 'PENDING') backendAction = 'REVIEW_OPS';
            else if (reviewModal.app.status === 'OPS_REVIEWED') backendAction = 'REVIEW_RISK';
            else if (reviewModal.app.status === 'RISK_REVIEWED') backendAction = 'APPROVE';
        }

        setAction({ id: reviewModal.app.id, type: backendAction });
        setReviewModal({ isOpen: false, app: null }); // Close review modal
        setIsSudoOpen(true); // Open Sudo for confirmation
    };

    const handleAutoAssess = async (appId: string) => {
        setAutoAssessing(appId);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await axios.post(
                `${apiUrl}/admin/merchant-applications/${appId}/auto-assess-risk`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Check if auto-approved or needs manual review
            const reviews = res.data.reviews || [];
            const latestReview = reviews[reviews.length - 1];

            if (latestReview?.automated) {
                const score = latestReview.creditScore || 0;
                const decision = latestReview.decision;

                toast({
                    title: decision === 'APPROVED' ? "✅ Auto-Approved" : decision === 'REJECTED' ? "❌ Auto-Rejected" : "⚠️ Manual Review Required",
                    description: `Credit Score: ${score}. ${latestReview.reasons?.join(', ') || ''}`,
                    variant: decision === 'REJECTED' ? 'destructive' : 'default'
                });
            }

            fetchApplications();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Auto-assessment failed",
                variant: "destructive"
            });
        } finally {
            setAutoAssessing(null);
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
            const url = `${apiUrl}/admin/merchant-applications/${action.id}/${action.type.toLowerCase().replace('_', '-')}`;

            // Construct body: Include reason (if reject) AND reviewData (checklist/notes)
            const body = {
                ...(action.type === 'REJECT' ? { reason: reviewData?.notes || 'Admin Rejected' } : {}),
                ...(reviewData || {})
            };

            await axios.post(url, body, { headers });

            toast({ title: "Success", description: "Application status updated" });
            fetchApplications();
        } catch (err: any) {
            console.error(err);
            toast({
                title: "Error",
                description: err.response?.data?.message || "Operation failed",
                variant: "destructive"
            });
        } finally {
            setAction(null);
            setReviewData(null);
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
                    {/* Bulk Actions Bar */}
                    {selectedIds.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900">
                                {selectedIds.length} application(s) selected
                            </span>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setBulkDeleteDialog(true)}
                                className="gap-2"
                            >
                                <Trash className="h-4 w-4" />
                                Delete Selected
                            </Button>
                        </div>
                    )}

                    {/* Responsive Table Wrapper */}
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-2 py-3 w-10">
                                        <Checkbox
                                            checked={selectedIds.length === applications.length && applications.length > 0}
                                            onCheckedChange={toggleAll}
                                        />
                                    </th>
                                    <th className="px-3 py-3 font-medium min-w-[180px]">Business</th>
                                    <th className="px-3 py-3 font-medium min-w-[140px]">Contact</th>
                                    <th className="px-3 py-3 font-medium min-w-[80px]">Volume</th>
                                    <th className="px-3 py-3 font-medium min-w-[120px]">Status</th>
                                    <th className="px-3 py-3 font-medium text-right min-w-[280px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-muted-foreground">No pending applications.</td>
                                    </tr>
                                )}
                                {applications.map((app) => (
                                    <tr key={app.id} className="border-t hover:bg-muted/50 transition-colors">
                                        <td className="px-2 py-3">
                                            <Checkbox
                                                checked={selectedIds.includes(app.id)}
                                                onCheckedChange={() => toggleSelection(app.id)}
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="font-medium">{app.businessName}</div>
                                            <div className="text-xs text-muted-foreground">{app.email}</div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div>{app.contactName}</div>
                                            <div className="text-xs text-muted-foreground">{app.phone}</div>
                                        </td>
                                        <td className="px-3 py-3">{app.monthlyVolume || 'N/A'}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex flex-col gap-1">
                                                <Badge variant={app.status === 'PENDING' ? 'outline' : app.status === 'APPROVED' ? 'default' : 'destructive'}>
                                                    {app.status}
                                                </Badge>
                                                {(() => {
                                                    const reviews = app.reviews || [];
                                                    const autoReview = reviews.find((r: any) => r.automated);
                                                    if (autoReview?.creditScore) {
                                                        const score = autoReview.creditScore;
                                                        const color = score >= 700 ? 'bg-green-100 text-green-800' : score >= 500 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
                                                        return (
                                                            <span className={`text-xs px-2 py-0.5 rounded ${color}`}>
                                                                Score: {score}
                                                            </span>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <div className="flex justify-end gap-1.5 items-center flex-wrap">
                                                <Button size="icon" variant="ghost" title="Review Details" onClick={() => openReview(app)}>
                                                    <Eye className="h-4 w-4 text-blue-600" />
                                                </Button>

                                                {app.status === 'PENDING' && (currentUser?.role === 'OPS_ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') && (
                                                    <Button size="sm" variant="outline" className="h-8 text-xs bg-yellow-50 text-yellow-700 border-yellow-200" onClick={() => openReview(app)}>
                                                        Start Ops Review
                                                    </Button>
                                                )}

                                                {app.status === 'OPS_REVIEWED' && (currentUser?.role === 'RISK_ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                                            onClick={() => handleAutoAssess(app.id)}
                                                            disabled={autoAssessing === app.id}
                                                        >
                                                            {autoAssessing === app.id ? '🔄 Assessing...' : '🤖 Auto-Assess Risk'}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-xs bg-orange-50 text-orange-700 border-orange-200"
                                                            onClick={() => openReview(app)}
                                                        >
                                                            Manual Risk Review
                                                        </Button>
                                                    </>
                                                )}

                                                {app.status === 'RISK_REVIEWED' && (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') && (
                                                    <Button size="sm" variant="outline" className="h-8 text-xs bg-green-50 text-green-700 border-green-200" onClick={() => openReview(app)}>
                                                        Final Approve
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
                                                        <DropdownMenuItem onClick={() => openDeleteDialog('hard', app)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
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
                onSuccess={() => fetchApplications()}
                applicationId={createModal.applicationId}
            />

            {/* Interactive Review Modal */}
            <ApplicationReviewModal
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal({ isOpen: false, app: null })}
                application={reviewModal.app}
                onReview={submitReview}
                loading={false}
            />

            <AlertDialog open={deleteDialog.open} onOpenChange={(open: boolean) => !open && setDeleteDialog({ open: false, type: null, app: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {deleteDialog.type === 'soft' ? 'Archive Application?' : '⚠️ Delete Permanently?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteDialog.type === 'soft'
                                ? `This will hide "${deleteDialog.app?.businessName}" from the list.`
                                : `This will permanently delete "${deleteDialog.app?.businessName}".`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className={deleteDialog.type === 'hard' ? 'bg-red-600' : ''}>
                            {deleteDialog.type === 'soft' ? 'Archive' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.length} Application(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {selectedIds.length} selected application(s) from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete {selectedIds.length} Application(s)
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
