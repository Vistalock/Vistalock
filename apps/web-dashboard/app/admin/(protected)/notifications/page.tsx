/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Info, AlertTriangle, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
    const notifications = [
        {
            id: 1,
            title: "System Update Scheduled",
            message: "Maintenance window scheduled for Dec 28, 02:00 AM UTC.",
            type: "info",
            time: "2 hours ago",
            icon: Info,
            color: "text-blue-500"
        },
        {
            id: 2,
            title: "High Locking Rate Detected",
            message: "15 devices were locked in the last hour. Check Audit Logs.",
            type: "warning",
            time: "5 hours ago",
            icon: AlertTriangle,
            color: "text-amber-500"
        },
        {
            id: 3,
            title: "New Merchant Approved",
            message: "TechWorld Ltd has completed onboarding.",
            type: "success",
            time: "1 day ago",
            icon: CheckCircle,
            color: "text-green-500"
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                    Alerts and system updates.
                </p>
            </div>
            <div className="space-y-4">
                {notifications.map((n) => (
                    <Card key={n.id}>
                        <CardContent className="flex items-start p-4 space-x-4">
                            <div className={`mt-1 ${n.color}`}>
                                <n.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="font-medium leading-none">{n.title}</p>
                                <p className="text-sm text-muted-foreground">{n.message}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{n.time}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
