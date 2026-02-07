'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Lock, Unlock, UserMinus, Settings } from 'lucide-react';

export default function OpsAuditLogsPage() {
    // Mock audit logs
    const logs = [
        { id: '1', timestamp: '2026-02-07 20:15:32', action: 'DEVICE_LOCK_RETRY', user: 'ops@vistalock.com', target: 'Device IMEI ...4582', details: 'Manual retry for failed lock command', result: 'SUCCESS' },
        { id: '2', timestamp: '2026-02-07 20:12:18', action: 'AGENT_SUSPEND', user: 'ops@vistalock.com', target: 'Agent: Mike Johnson', details: 'Suspended due to high overdue rate (28%)', result: 'SUCCESS' },
        { id: '3', timestamp: '2026-02-07 20:08:45', action: 'DEVICE_UNLOCK_RETRY', user: 'ops@vistalock.com', target: 'Device IMEI ...9921', details: 'Customer payment confirmed, retry unlock', result: 'SUCCESS' },
        { id: '4', timestamp: '2026-02-07 19:55:03', action: 'SYSTEM_CONFIG_UPDATE', user: 'superadmin@vistalock.com', target: 'Heartbeat Interval', details: 'Updated from 5min to 3min', result: 'SUCCESS' },
        { id: '5', timestamp: '2026-02-07 19:42:22', action: 'TICKET_ESCALATE', user: 'ops@vistalock.com', target: 'Ticket TKT-1244', details: 'Escalated to Risk team', result: 'SUCCESS' },
        { id: '6', timestamp: '2026-02-07 19:30:15', action: 'DEVICE_FLAG', user: 'ops@vistalock.com', target: 'Device IMEI ...3322', details: 'Flagged for investigation - offline >48h', result: 'SUCCESS' },
        { id: '7', timestamp: '2026-02-07 19:15:08', action: 'AGENT_ESCALATE', user: 'ops@vistalock.com', target: 'Agent: David Brown', details: 'Escalated to Compliance - overdue rate 22%', result: 'SUCCESS' },
    ];

    const getActionIcon = (action: string) => {
        if (action.includes('LOCK')) return <Lock className="h-4 w-4 text-red-500" />;
        if (action.includes('UNLOCK')) return <Unlock className="h-4 w-4 text-green-500" />;
        if (action.includes('AGENT')) return <UserMinus className="h-4 w-4 text-yellow-500" />;
        if (action.includes('CONFIG')) return <Settings className="h-4 w-4 text-blue-500" />;
        return <FileText className="h-4 w-4 text-gray-500" />;
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
                <p className="text-muted-foreground">Read-only traceability of operational actions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Actions Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{logs.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Device Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{logs.filter(l => l.action.includes('DEVICE')).length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Agent Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{logs.filter(l => l.action.includes('AGENT')).length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">System Changes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{logs.filter(l => l.action.includes('SYSTEM')).length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Audit Log Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Operational Audit Trail</CardTitle>
                    <CardDescription>Chronological log of all Ops Admin actions (read-only)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px]">
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div key={log.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50">
                                    <div className="mt-1">
                                        {getActionIcon(log.action)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-xs">
                                                {log.action}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground font-mono">{log.timestamp}</span>
                                        </div>
                                        <div className="text-sm font-medium">{log.target}</div>
                                        <div className="text-xs text-muted-foreground">{log.details}</div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-muted-foreground">by {log.user}</span>
                                            <Badge variant={log.result === 'SUCCESS' ? 'default' : 'destructive'} className="text-[10px]">
                                                {log.result}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
