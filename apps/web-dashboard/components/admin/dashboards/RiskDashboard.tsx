/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, AlertOctagon, Ban, FileWarning, PieChart, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface RiskDashboardProps {
    stats: any;
}

export default function RiskDashboard({ stats }: RiskDashboardProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Risk Dashboard</h2>
                    <p className="text-muted-foreground">Monitor portfolio health, defaults, and exposure.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Portfolio Exposure</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦45.2M</div>
                        <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Default Rate</CardTitle>
                        <AlertOctagon className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">4.2%</div>
                        <p className="text-xs text-muted-foreground">Target: &lt; 5.0%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue Loans</CardTitle>
                        <FileWarning className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">18</div>
                        <p className="text-xs text-muted-foreground">Needs follow-up</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
                        <PieChart className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">92%</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* High Risk Merchants */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>High Risk Merchants</CardTitle>
                        <CardDescription>Merchants with high default rates or suspicious activity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Gadget World Ltd</p>
                                    <p className="text-xs text-muted-foreground font-medium text-red-500">Default Rate: 12% (Critical)</p>
                                </div>
                                <Button size="sm" variant="destructive">Freeze Onboarding</Button>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Phone King Ventures</p>
                                    <p className="text-xs text-muted-foreground text-yellow-600">Late Payments: 8% (Warning)</p>
                                </div>
                                <Button size="sm" variant="outline">Review Limits</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Fraud Signals */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Fraud Signals</CardTitle>
                        <CardDescription>Potential fraud patterns detected.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Ban className="h-4 w-4 text-red-500 mr-2" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Identity Reuse</p>
                                    <p className="text-xs text-muted-foreground">3 Directors linked to bad debt</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Users className="h-4 w-4 text-yellow-500 mr-2" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Collusion Check</p>
                                    <p className="text-xs text-muted-foreground">Unusual referral pattern detected</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
