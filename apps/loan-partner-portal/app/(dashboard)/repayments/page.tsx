"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

// Mock Repayments
const MOCK_REPAYMENTS = [
    { id: 'PAY-8821', loanId: 'LN-2201', customer: 'Alice Brown', amount: 15000, status: 'SUCCESS', date: '2025-06-01 10:30 AM' },
    { id: 'PAY-8822', loanId: 'LN-3305', customer: 'Bob White', amount: 12500, status: 'FAILED', date: '2025-06-01 11:15 AM' },
    { id: 'PAY-8823', loanId: 'LN-1102', customer: 'Charlie Green', amount: 20000, status: 'SUCCESS', date: '2025-06-01 12:45 PM' },
];

export default function RepaymentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Repayment Monitoring</h1>
                    <p className="text-sm text-gray-500">Track collections and repayment health</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Collection Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">94.5%</div>
                        <p className="text-xs text-gray-500">Last 30 Days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Today's Collections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(345000)}</div>
                        <p className="text-xs text-gray-500">18 Transactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Overdue Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(1250000)}</div>
                        <p className="text-xs text-gray-500">+5% vs last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Projected (This Month)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(8500000)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Repayment Heatmap (Mock Visual) */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Collection Heatmap</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-12 gap-1 h-[200px]">
                            {Array.from({ length: 84 }).map((_, i) => {
                                const opacity = Math.random();
                                return (
                                    <div
                                        key={i}
                                        className="rounded-sm bg-green-500"
                                        style={{ opacity: opacity < 0.3 ? 0.1 : opacity }}
                                        title={`Day ${i + 1}: ${Math.round(opacity * 100)}% Collection`}
                                    />
                                )
                            })}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>Less Frequent</span>
                            <span>More Frequent</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Aging Buckets */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Aging Buckets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>1 - 7 Days</span>
                                <span className="font-bold">₦450,000 (12 Loans)</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 w-[25%]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>8 - 30 Days</span>
                                <span className="font-bold">₦1,200,000 (8 Loans)</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 w-[60%]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>31+ Days (Default)</span>
                                <span className="font-bold">₦350,000 (2 Loans)</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-red-600 w-[15%]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
