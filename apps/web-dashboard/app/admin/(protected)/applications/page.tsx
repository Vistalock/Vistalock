
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { SudoModal } from '@/components/ui/sudo-modal';
import { CreateMerchantModal } from '@/components/ui/create-merchant-modal';
import { ApplicationDetailsModal } from '@/components/ui/application-details-modal';

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [viewModal, setViewModal] = useState<{ isOpen: boolean, app: any | null }>({ isOpen: false, app: null });
    const [createModal, setCreateModal] = useState<{ isOpen: boolean, applicationId: string | null }>({ isOpen: false, applicationId: null });
    const [isSudoOpen, setIsSudoOpen] = useState(false);

    // Action state
    const [action, setAction] = useState<{ id: string, type: 'APPROVE' | 'REJECT' | 'REVIEW_OPS' | 'REVIEW_RISK' } | null>(null);

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
                                        </div>
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
        </div>
    );
}
