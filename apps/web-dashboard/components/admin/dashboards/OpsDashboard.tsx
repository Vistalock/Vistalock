/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Smartphone, Users, AlertTriangle, Activity, HeadphonesIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface OpsDashboardProps {
    stats: any;
}

export default function OpsDashboard({ stats }: OpsDashboardProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Operations Dashboard</h2>
                    <p className="text-muted-foreground">Monitor system health, devices, and agent activity.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDevices}</div>
                        <p className="text-xs text-muted-foreground">Total fleet size</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Locked Devices</CardTitle>
                        <Shield className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.lockedDevices}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalDevices > 0 ? ((stats.lockedDevices / stats.totalDevices) * 100).toFixed(1) : 0}% locked
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                        <HeadphonesIcon className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground">Open tickets</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Device Operations Panel */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Device Operations</CardTitle>
                        <CardDescription>Recent lock/unlock activities and failures.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Samsung A14 (IMEI ...4582)</p>
                                    <p className="text-xs text-muted-foreground">Lock command sent - Failed (Offline)</p>
                                </div>
                                <Button size="sm" variant="outline">Retry</Button>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Infinix Hot 30 (IMEI ...9921)</p>
                                    <p className="text-xs text-muted-foreground">Unlock command sent - Success</p>
                                </div>
                                <div className="text-green-600 text-sm font-medium">Done</div>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Tecno Spark 10 (IMEI ...1123)</p>
                                    <p className="text-xs text-muted-foreground">Heartbeat missed (24h)</p>
                                </div>
                                <Button size="sm" variant="outline">Check</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                        <CardDescription>Real-time infrastructure status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">API Gateway</p>
                                    <p className="text-xs text-muted-foreground">Uptime: 99.9%</p>
                                </div>
                                <div className="text-sm font-medium text-green-600">Operational</div>
                            </div>
                            <div className="flex items-center">
                                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Database</p>
                                    <p className="text-xs text-muted-foreground">Connections: Optimal</p>
                                </div>
                                <div className="text-sm font-medium text-green-600">Operational</div>
                            </div>
                            <div className="flex items-center">
                                <span className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></span>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Locking Service</p>
                                    <p className="text-xs text-muted-foreground">Latency: 145ms</p>
                                </div>
                                <div className="text-sm font-medium text-yellow-600">Degraded</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
