'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, ServerCrash, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';

export function TransactionFlowMonitor() {
    return (
        <Card className="col-span-1 border-t-4 border-t-purple-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    💸 Transaction Flow Monitor
                </CardTitle>
                <CardDescription>Pipeline health & API status.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {/* BNPL Success Rate */}
                    <div className="p-3 bg-muted/40 rounded-lg flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">BNPL Initiation Rate</span>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold text-green-600">98.2%</span>
                            <Activity className="h-4 w-4 text-green-500 mb-1" />
                        </div>
                        <span className="text-[10px] text-green-600 flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-0.5" /> +1.2% this week
                        </span>
                    </div>

                    {/* API Status */}
                    <div className="p-3 bg-muted/40 rounded-lg flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">Loan Partner API</span>
                        <div className="flex items-end justify-between">
                            <span className="text-lg font-bold text-green-600">Operational</span>
                            <CheckCircle2 className="h-4 w-4 text-green-500 mb-1" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">Latency: 240ms</span>
                    </div>

                    {/* Webhook Delivery */}
                    <div className="p-3 bg-muted/40 rounded-lg flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">Webhook Delivery</span>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold text-yellow-600">95.5%</span>
                            <ServerCrash className="h-4 w-4 text-yellow-500 mb-1" />
                        </div>
                        <span className="text-[10px] text-yellow-600">12 retries pending</span>
                    </div>

                    {/* Settlement Queue */}
                    <div className="p-3 bg-muted/40 rounded-lg flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">Settlement Queue</span>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold">14</span>
                            <Activity className="h-4 w-4 text-blue-500 mb-1" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">Processing normally</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
