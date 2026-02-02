import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Activity, AlertTriangle, CheckCircle } from "lucide-react";

export default function PartnerDashboard() {
    // TODO: Fetch real stats from API
    const stats = [
        {
            title: "Total Disbursed",
            value: "₦45,231,000",
            description: "+20.1% from last month",
            icon: DollarSign,
        },
        {
            title: "Active Loans",
            value: "2,350",
            description: "Currently performing",
            icon: Activity,
        },
        {
            title: "Active Locks",
            value: "145",
            description: "Devices currently locked",
            icon: AlertTriangle,
        },
        {
            title: "Repayment Rate",
            value: "94.2%",
            description: "Healthy portfolio",
            icon: CheckCircle
        }
    ];

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
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
