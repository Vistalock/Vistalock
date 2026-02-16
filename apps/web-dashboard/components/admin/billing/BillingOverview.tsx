"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, CreditCard, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingOverview() {
    // Mock data for now, waiting for backend implementation
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-billing-overview'],
        queryFn: async () => {
            // const res = await api.get('/admin/billing/overview');
            // return res.data;

            // Simulation
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                totalRevenue: 15420000,
                revenueChange: 12.5,
                activeMerchants: 142,
                pendingPayments: 450000,
                recentTransactions: [
                    { id: 1, merchant: "TechStore Ikeja", amount: 50000, type: "TOPUP", date: new Date().toISOString() },
                    { id: 2, merchant: "Gadget World", amount: -2500, type: "ENROLLMENT", date: new Date().toISOString() },
                    { id: 3, merchant: "Mobile Hub", amount: 100000, type: "TOPUP", date: new Date().toISOString() },
                ]
            };
        }
    });

    if (isLoading) {
        return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
        </div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
                        <p className="text-xs text-muted-foreground">
                            +{stats?.revenueChange}% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Merchants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeMerchants}</div>
                        <p className="text-xs text-muted-foreground">
                            +4 new this week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.pendingPayments || 0)}</div>
                        <p className="text-xs text-muted-foreground">
                            Unsettled invoices
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Revenue / User</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(108500)}</div>
                        <p className="text-xs text-muted-foreground">
                            +2.1% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats?.recentTransactions.map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium">{tx.merchant}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                                <div className={`font-bold ${tx.type === 'TOPUP' ? 'text-green-600' : 'text-gray-900'}`}>
                                    {tx.type === 'TOPUP' ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
