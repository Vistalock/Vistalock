/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Smartphone, AlertTriangle, Activity, HeadphonesIcon, UserPlus, ShieldAlert, WifiOff } from 'lucide-react';
import { DeviceOperationsPanel } from './widgets/DeviceOperationsPanel';
import { TransactionFlowMonitor } from './widgets/TransactionFlowMonitor';
import { AgentActivityMonitor } from './widgets/AgentActivityMonitor';
import { SystemHealth } from './widgets/SystemHealth';
import { OpsAuditLog } from './widgets/OpsAuditLog';

interface OpsDashboardProps {
    stats: any;
}

export default function OpsDashboard({ stats }: OpsDashboardProps) {
    // Mock extended stats (In real app, fetch these)
    const opsStats = {
        ...stats,
        lockFailures: 3,
        heartbeatFailures: 8,
        agentOnboarding: 12,
        openTickets: 5
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Operations Dashboard</h2>
                    <p className="text-muted-foreground">Monitor system health, devices, and agent activity.</p>
                </div>
            </div>

            {/* 1. Operations Overview (KPI Cards) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
                        <Smartphone className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{opsStats.totalDevices || 0}</div>
                        <p className="text-xs text-muted-foreground">Total fleet size</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Locked Devices</CardTitle>
                        <Shield className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{opsStats.lockedDevices || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {opsStats.totalDevices > 0 ? ((opsStats.lockedDevices / opsStats.totalDevices) * 100).toFixed(1) : 0}% locked
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lock Failures</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{opsStats.lockFailures}</div>
                        <p className="text-xs text-muted-foreground">Critical alerts</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Heartbeat Issues</CardTitle>
                        <WifiOff className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{opsStats.heartbeatFailures}</div>
                        <p className="text-xs text-muted-foreground">Offline > 24h</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agent Onboarding</CardTitle>
                        <UserPlus className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{opsStats.agentOnboarding}</div>
                        <p className="text-xs text-muted-foreground">New agents today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                        <HeadphonesIcon className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{opsStats.openTickets}</div>
                        <p className="text-xs text-muted-foreground">Open queue</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-12">

                {/* Left Column: Device Ops & Transactions (8 cols) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                    {/* 2. Device Operations Panel */}
                    <DeviceOperationsPanel />

                    {/* 3. Transaction Flow Monitor */}
                    <TransactionFlowMonitor />
                </div>

                {/* Right Column: Agent Activity & System Health (4 cols) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                    {/* 4. Agent Activity Monitor */}
                    <AgentActivityMonitor />

                    {/* 5. System Health */}
                    <SystemHealth />

                    {/* 7. Read-Only Audit Log */}
                    <OpsAuditLog />
                </div>
            </div>
        </div>
    );
}
