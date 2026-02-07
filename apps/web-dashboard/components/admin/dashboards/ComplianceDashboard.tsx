/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileCheck, Users, AlertTriangle, Scale, Activity, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ComplianceDashboardProps {
    stats: any;
}

export default function ComplianceDashboard({ stats }: ComplianceDashboardProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h2>
                    <p className="text-muted-foreground">Monitor regulatory compliance, KYC, and document reviews.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">Merchant applications</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">KYC Failures</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">3</div>
                        <p className="text-xs text-muted-foreground">Requires manual intervention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Regulatory Flags</CardTitle>
                        <Scale className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">1</div>
                        <p className="text-xs text-muted-foreground">Potential violations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Appeals</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">Escalated reviews</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Merchant Compliance Review */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Merchant Compliance Review</CardTitle>
                        <CardDescription>Applications awaiting document verification.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Lagos Gadgets Ltd</p>
                                    <p className="text-xs text-muted-foreground">CAC Cert mismatch detected</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">View Docs</Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Global Phones Ent.</p>
                                    <p className="text-xs text-muted-foreground">Director ID unreadable</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">View Docs</Button>
                                    <Button size="sm" variant="destructive">Reject</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Regulatory Reporting */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Regulatory Reporting</CardTitle>
                        <CardDescription>Generate reports for audit and compliance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">Merchant Registry Export</span>
                                </div>
                                <Button size="sm" variant="ghost">Download</Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">Active Loan Summary</span>
                                </div>
                                <Button size="sm" variant="ghost">Download</Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">Device Lock Registry</span>
                                </div>
                                <Button size="sm" variant="ghost">Download</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
