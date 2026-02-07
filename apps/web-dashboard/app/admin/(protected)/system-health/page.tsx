'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Server, Database, Activity, Wifi, AlertTriangle } from 'lucide-react';

export default function OpsSystemHealthPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
                <p className="text-muted-foreground">Platform reliability and infrastructure monitoring</p>
            </div>

            {/* Service Status Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Server className="h-4 w-4 text-green-500" />
                            API Gateway
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Uptime</span>
                                <Badge variant="default">99.9%</Badge>
                            </div>
                            <Progress value={99.9} className="h-2" />
                            <div className="text-xs text-green-600 font-medium">Operational</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Database className="h-4 w-4 text-green-500" />
                            Database
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">CPU Load</span>
                                <span className="text-xs font-medium">24%</span>
                            </div>
                            <Progress value={24} className="h-2" />
                            <div className="text-xs text-green-600 font-medium">Healthy</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Activity className="h-4 w-4 text-yellow-500" />
                            Lock Service
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Latency</span>
                                <span className="text-xs font-medium text-yellow-600">145ms</span>
                            </div>
                            <Progress value={65} className="h-2 [&>*]:bg-yellow-500" />
                            <div className="text-xs text-yellow-600 font-medium">Degraded</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Wifi className="h-4 w-4 text-green-500" />
                            Webhook Queue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Backlog</span>
                                <span className="text-xs font-medium">12 jobs</span>
                            </div>
                            <Progress value={8} className="h-2" />
                            <div className="text-xs text-green-600 font-medium">Normal</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Server className="h-4 w-4 text-green-500" />
                            Auth Service
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Response Time</span>
                                <span className="text-xs font-medium">45ms</span>
                            </div>
                            <Progress value={15} className="h-2" />
                            <div className="text-xs text-green-600 font-medium">Optimal</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Database className="h-4 w-4 text-green-500" />
                            Redis Cache
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Hit Rate</span>
                                <span className="text-xs font-medium">94%</span>
                            </div>
                            <Progress value={94} className="h-2" />
                            <div className="text-xs text-green-600 font-medium">Excellent</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Device Agent Heartbeat */}
            <Card>
                <CardHeader>
                    <CardTitle>Device Agent Heartbeat Status</CardTitle>
                    <CardDescription>Android agent version distribution and connectivity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-100 p-4 rounded-lg text-center">
                            <div className="text-3xl font-bold">85%</div>
                            <div className="text-sm text-muted-foreground">v2.1.0 (Latest)</div>
                            <Badge variant="default" className="mt-2">Current</Badge>
                        </div>
                        <div className="bg-slate-100 p-4 rounded-lg text-center">
                            <div className="text-3xl font-bold text-yellow-600">12%</div>
                            <div className="text-sm text-muted-foreground">v2.0.0</div>
                            <Badge variant="secondary" className="mt-2">Update Needed</Badge>
                        </div>
                        <div className="bg-slate-100 p-4 rounded-lg text-center">
                            <div className="text-3xl font-bold text-red-600">3%</div>
                            <div className="text-sm text-muted-foreground">Legacy</div>
                            <Badge variant="destructive" className="mt-2">Critical</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Incidents */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Incidents</CardTitle>
                    <CardDescription>Last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div className="flex-1">
                                <div className="font-medium text-sm">Lock Service Latency Spike</div>
                                <div className="text-xs text-muted-foreground">2026-02-07 18:45 - Latency increased to 145ms (SLA: 100ms)</div>
                            </div>
                            <Badge variant="secondary">Investigating</Badge>
                        </div>
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div className="flex-1">
                                <div className="font-medium text-sm">Webhook Queue Backlog</div>
                                <div className="text-xs text-muted-foreground">2026-02-07 16:20 - Queue reached 150 jobs (threshold: 100)</div>
                            </div>
                            <Badge variant="default">Resolved</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
