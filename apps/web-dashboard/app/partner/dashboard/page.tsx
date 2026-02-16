'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Activity, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function PartnerDashboard() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDisbursed: 0,
        activeLoans: 0,
        activeLocks: 0,
        repaymentRate: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/loan-partner-api/stats');
                setStats(res.data);
            } catch (error: any) {
                console.error('Failed to fetch stats:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load dashboard statistics",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [toast]);

    const statCards = [
        {
            title: "Total Disbursed",
            value: `₦${stats.totalDisbursed.toLocaleString()}`,
            description: "Total volume financed",
            icon: DollarSign,
        },
        {
            title: "Active Loans",
            value: stats.activeLoans.toLocaleString(),
            description: "App currently performing",
            icon: Activity,
        },
        {
            title: "Active Locks",
            value: stats.activeLocks.toLocaleString(),
            description: "Devices currently locked",
            icon: AlertTriangle,
        },
        {
            title: "Repayment Rate",
            value: `${stats.repaymentRate}%`,
            description: "Portfolio health",
            icon: CheckCircle
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Loans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">No recent loans to display.</p>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Device Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">All systems operational.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
