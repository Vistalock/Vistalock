'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Server, Database, Lock, Smartphone } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export function SystemHealth() {
    return (
        <Card className="col-span-1 border-t-4 border-t-slate-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    🖥️ System Health
                </CardTitle>
                <CardDescription>Infrastructure & Performance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Metric Item */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Server className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-sm font-medium">API Gateway</span>
                        </div>
                        <span className="text-xs text-green-600 font-bold">Operational (99.9%)</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Database className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-sm font-medium">Database Load</span>
                        </div>
                        <span className="text-xs text-muted-foreground">24% CPU</span>
                    </div>
                    <Progress value={24} className="h-1.5 bg-slate-100" />
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Lock className="h-3.5 w-3.5 text-yellow-500" />
                            <span className="text-sm font-medium">Locking Service Latency</span>
                        </div>
                        <span className="text-xs text-yellow-600 font-bold">145ms (Degraded)</span>
                    </div>
                    <Progress value={65} className="h-1.5 bg-slate-100 [&>*]:bg-yellow-500" />
                </div>

                <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                        <Smartphone className="h-3 w-3" /> Android Agent Adoption
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-100 p-1 rounded">
                            <div className="text-lg font-bold">85%</div>
                            <div className="text-[10px] text-muted-foreground">v2.1.0</div>
                        </div>
                        <div className="bg-slate-100 p-1 rounded">
                            <div className="text-lg font-bold text-yellow-600">12%</div>
                            <div className="text-[10px] text-muted-foreground">v2.0.0</div>
                        </div>
                        <div className="bg-slate-100 p-1 rounded">
                            <div className="text-lg font-bold text-red-600">3%</div>
                            <div className="text-[10px] text-muted-foreground">Legacy</div>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
