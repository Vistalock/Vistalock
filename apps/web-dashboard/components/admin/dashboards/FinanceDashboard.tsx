/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Wallet, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FinanceDashboardProps {
    stats: any;
}

export default function FinanceDashboard({ stats }: FinanceDashboardProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Finance Dashboard</h2>
                    <p className="text-muted-foreground">Manage settlements, commissions, and reconciliation.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Settlements</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦12.5M</div>
                        <p className="text-xs text-muted-foreground">Processed this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
                        <RefreshCw className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">₦1.2M</div>
                        <p className="text-xs text-muted-foreground">Awaiting bank confirmation</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Held Commissions</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">₦450k</div>
                        <p className="text-xs text-muted-foreground">30% retention pool</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Discrepancies</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">2</div>
                        <p className="text-xs text-muted-foreground">Unreconciled items</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Settlement Management */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Settlement Management</CardTitle>
                        <CardDescription>Recent payouts and status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Weekly Payout - Batch #8812</p>
                                    <p className="text-xs text-muted-foreground">Amount: ₦2,450,000 • 15 Merchants</p>
                                </div>
                                <div className="text-yellow-600 text-sm font-medium flex items-center gap-2">
                                    Pending
                                    <Button size="sm" variant="outline">Confirm</Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Agent Commission Release - Q3</p>
                                    <p className="text-xs text-muted-foreground">Amount: ₦150,000</p>
                                </div>
                                <div className="text-green-600 text-sm font-medium">Completed</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Reports */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Financial Reports</CardTitle>
                        <CardDescription>Export financial data for reconciliation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">Merchant Payout Report</span>
                                </div>
                                <Button size="sm" variant="ghost">Download</Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">Agent Earnings Summary</span>
                                </div>
                                <Button size="sm" variant="ghost">Download</Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">Revenue & Loss Statement</span>
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
