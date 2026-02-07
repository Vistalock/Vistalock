/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, FileText, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'APPROVED': return 'default';
        case 'PENDING': return 'secondary';
        case 'REJECTED': return 'destructive';
        case 'UNDER_REVIEW': return 'outline';
        default: return 'secondary';
    }
};

export default function MerchantReviewsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const response = await axios.get(`${apiUrl}/admin/applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            await axios.patch(`${apiUrl}/admin/applications/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({
                title: "Success",
                description: "Merchant application approved successfully"
            });
            fetchApplications();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to approve application",
                variant: "destructive"
            });
        }
    }

    const handleReject = async (id: string) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            await axios.patch(`${apiUrl}/admin/applications/${id}/reject`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({
                title: "Success",
                description: "Merchant application rejected"
            });
            fetchApplications();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to reject application",
                variant: "destructive"
            });
        }
    }

    const handleRequestInfo = async (id: string) => {
        const message = prompt("What additional information is required?");
        if (!message) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            await axios.patch(`${apiUrl}/admin/applications/${id}/request-info`, { message }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({
                title: "Success",
                description: "Information request sent to merchant"
            });
            fetchApplications();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to send request",
                variant: "destructive"
            });
        }
    }

    if (loading) return <div className="p-4">Loading applications...</div>;

    const pendingApplications = applications.filter(app => app.status === 'PENDING' || app.status === 'UNDER_REVIEW');
    const reviewedApplications = applications.filter(app => app.status !== 'PENDING' && app.status !== 'UNDER_REVIEW');

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Merchant Reviews</h1>
                <p className="text-sm text-muted-foreground">
                    Review and approve merchant KYC/KYB applications
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                    <AlertCircle className="h-4 w-4" />
                    <span>Compliance Admin: Final approval authority for merchant onboarding</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingApplications.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {applications.filter(a => a.status === 'APPROVED').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {applications.filter(a => a.status === 'REJECTED').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{applications.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Applications */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Pending Applications</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingApplications.map((app) => (
                        <Card key={app.id} className="relative">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        <CardTitle className="text-lg">{app.businessName}</CardTitle>
                                    </div>
                                    <Badge variant={getStatusVariant(app.status)}>
                                        {app.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium">{app.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Business Type:</span>
                                        <span className="font-medium">{app.businessType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Submitted:</span>
                                        <span className="font-medium">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    <Button
                                        onClick={() => handleApprove(app.id)}
                                        size="sm"
                                        className="w-full"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleReject(app.id)}
                                            size="sm"
                                            variant="destructive"
                                            className="flex-1"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                        </Button>
                                        <Button
                                            onClick={() => handleRequestInfo(app.id)}
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Request Info
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {pendingApplications.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No pending applications</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Reviewed Applications */}
            {reviewedApplications.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-4">Recently Reviewed</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {reviewedApplications.slice(0, 6).map((app) => (
                            <Card key={app.id} className="relative opacity-75">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                            <CardTitle className="text-lg">{app.businessName}</CardTitle>
                                        </div>
                                        <Badge variant={getStatusVariant(app.status)}>
                                            {app.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium">{app.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Reviewed:</span>
                                        <span className="font-medium">
                                            {new Date(app.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
