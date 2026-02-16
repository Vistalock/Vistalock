"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function DashboardPage() {
    const { user } = useAuth();

    // Fetch dashboard stats
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/loan-partner-api/stats');
            return res.data;
        },
        enabled: !!user
    });

    const statCards = [
        {
            title: "Total Disbursed",
            value: stats ? `₦${stats.totalDisbursed.toLocaleString()}` : '₦0',
            icon: CreditCard,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: "Active Loans",
            value: stats?.activeLoans || 0,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-100"
        },
        {
            title: "Active Locks",
            value: stats?.activeLocks || 0,
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-100"
        },
        {
            title: "Repayment Rate",
            value: stats ? `${stats.repaymentRate}%` : '0%',
            icon: CheckCircle,
            color: "text-gray-600",
            bg: "bg-gray-100"
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Overview of your lending portfolio with {user?.merchantName}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-7 w-20 animate-pulse bg-gray-200 rounded" />
                            ) : (
                                <div className="text-2xl font-bold">{stat.value}</div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity or Loans Table could go here */}
        </div>
    );
}
