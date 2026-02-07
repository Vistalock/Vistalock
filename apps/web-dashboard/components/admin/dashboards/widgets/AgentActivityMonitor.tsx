'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, UserMinus, ShieldAlert } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export function AgentActivityMonitor() {
    return (
        <Card className="col-span-1 border-t-4 border-t-orange-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    🕵️ Agent Activity Monitor
                </CardTitle>
                <CardDescription>Operational risks & behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 border rounded bg-slate-50">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div>
                            <div className="text-xl font-bold">12</div>
                            <div className="text-[10px] text-muted-foreground">Onboarded Today</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded bg-slate-50">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                            <div className="text-xl font-bold">3</div>
                            <div className="text-[10px] text-muted-foreground">Flagged High Risk</div>
                        </div>
                    </div>
                </div>

                {/* Risky Agent List */}
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">Requires Attention</h4>

                    <div className="flex items-center justify-between p-2 bg-red-50 border border-red-100 rounded-md">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-red-600" />
                            <div>
                                <p className="text-sm font-medium text-red-900">Agent: John Doe</p>
                                <p className="text-[10px] text-red-700">Abnormal failed transactions (15 in 1h)</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button size="icon" variant="destructive" className="h-7 w-7" title="Suspend Agent">
                                <UserMinus className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-100 rounded-md">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium text-yellow-900">Agent: Jane Smith</p>
                                <p className="text-[10px] text-yellow-700">Mismatch in device reporting</p>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs">Review</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
