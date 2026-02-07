'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function OpsAuditLog() {
    const logs = [
        { id: 1, action: 'DEVICE_LOCK_RETRY', user: 'ops@vistalock.com', details: 'Manual retry for IMEI ...4582', time: '10:42 AM' },
        { id: 2, action: 'AGENT_SUSPEND', user: 'risk@vistalock.com', details: 'Suspended Agent: John Doe', time: '09:15 AM' },
        { id: 3, action: 'SYSTEM_CONFIG_UPDATE', user: 'superadmin@vistalock.com', details: 'Updated heartbeat interval', time: 'Yesterday' },
        { id: 4, action: 'DEVICE_UNLOCK', user: 'ops@vistalock.com', details: 'Unlocked Device ...9921', time: 'Yesterday' },
        { id: 5, action: 'TICKET_RESOLVE', user: 'ops@vistalock.com', details: 'Resolved Ticket #4421', time: 'Yesterday' },
    ];

    return (
        <Card className="col-span-1 border-t-4 border-t-slate-400 shadow-sm h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">📜 Recent Audit Logs</CardTitle>
                <CardDescription>Read-only view of recent actions.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[250px] w-full pr-4">
                    <div className="space-y-4">
                        {logs.map(log => (
                            <div key={log.id} className="text-sm border-b pb-2 last:border-0">
                                <div className="flex items-center justify-between mb-1">
                                    <Badge variant="outline" className="text-[10px]">{log.action}</Badge>
                                    <span className="text-xs text-muted-foreground">{log.time}</span>
                                </div>
                                <p className="font-medium text-xs">{log.details}</p>
                                <p className="text-[10px] text-muted-foreground">by {log.user}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
