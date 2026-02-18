"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, AlertCircle, CheckCircle, TrendingUp, Users, Smartphone, Wallet } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from "@/lib/utils";

// Mock Data for Charts (Phase 1)
const REPAYMENT_DATA = [
    { name: 'Mon', collected: 4000, expected: 4500 },
    { name: 'Tue', collected: 3000, expected: 3200 },
    { name: 'Wed', collected: 2000, expected: 4000 },
    { name: 'Thu', collected: 2780, expected: 3000 },
    { name: 'Fri', collected: 1890, expected: 2500 },
    { name: 'Sat', collected: 2390, expected: 2500 },
    { name: 'Sun', collected: 3490, expected: 3500 },
];

export default function DashboardPage() {
    const { user } = useAuth();

    // Mock Stats
    const stats = {
        totalDisbursed: 15400000,
        activeLoans: 142,
        repaymentRate: 94.5,
        defaultRate: 2.1,
        activeLocks: 5,
        avgTicketSize: 108000,
    };

    const statCards = [
        {
            title: "Total Portfolio Value",
            value: formatCurrency(stats.totalDisbursed),
            sub: "+12% from last month",
            icon: Wallet,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: "Performance",
            value: `${stats.repaymentRate}%`,
            sub: "Repayment Rate",
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-100"
        },
        {
            title: "Risk Level",
            value: `${stats.defaultRate}%`,
            sub: "Default Rate",
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-100"
        },
        {
            title: "Active Devices",
            value: stats.activeLoans,
            sub: `${stats.activeLocks} Locked`,
            icon: Smartphone,
            color: "text-purple-600",
            bg: "bg-purple-100"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Executive Overview</h1>
                    <p className="text-sm text-gray-500">Welcome back, {user?.name || 'Partner'}</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Repayment Trend Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Repayment Trends</CardTitle>
                        <CardDescription>Daily collections vs expected amounts</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={REPAYMENT_DATA}>
                                    <defs>
                                        <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="collected" stroke="#10B981" fillOpacity={1} fill="url(#colorCollected)" />
                                    <Area type="monotone" dataKey="expected" stroke="#94A3B8" fillOpacity={0} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Overdue Breakdown / Risk */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Portfolio Health</CardTitle>
                        <CardDescription>Breakdown of loan status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Healthy (On Track)</p>
                                    <p className="text-xs text-muted-foreground">92% of portfolio</p>
                                </div>
                                <div className="font-bold text-green-600">130 Loans</div>
                            </div>
                            <div className="flex items-center">
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Grace Period</p>
                                    <p className="text-xs text-muted-foreground">3% of portfolio</p>
                                </div>
                                <div className="font-bold text-yellow-600">8 Loans</div>
                            </div>
                            <div className="flex items-center">
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Overdue (1-30 Days)</p>
                                    <p className="text-xs text-muted-foreground">3% of portfolio</p>
                                </div>
                                <div className="font-bold text-orange-600">3 Loans</div>
                            </div>
                            <div className="flex items-center">
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Defaulted (&gt;30 Days)</p>
                                    <p className="text-xs text-muted-foreground">1% of portfolio</p>
                                </div>
                                <div className="font-bold text-red-600">1 Loan</div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t">
                            <h4 className="text-sm font-medium mb-4">Recommended Actions</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Review 3 overdue accounts</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                    <Wallet className="h-4 w-4" />
                                    <span>Fund wallet (Low balance)</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
