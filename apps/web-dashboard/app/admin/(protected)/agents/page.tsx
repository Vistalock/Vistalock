'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, AlertTriangle, UserMinus, ShieldAlert, Ban } from 'lucide-react';

export default function OpsAgentsPage() {
    // Mock agent data
    const agents = [
        { id: '1', name: 'John Doe', email: 'john@techmart.com', merchant: 'TechMart Ltd', status: 'ACTIVE', devicesAssigned: 12, overdueRate: '5%', onboardedToday: false },
        { id: '2', name: 'Jane Smith', email: 'jane@phoneplus.com', merchant: 'PhonePlus Inc', status: 'ACTIVE', devicesAssigned: 8, overdueRate: '3%', onboardedToday: true },
        { id: '3', name: 'Mike Johnson', email: 'mike@mobilehub.com', merchant: 'MobileHub', status: 'SUSPENDED', devicesAssigned: 15, overdueRate: '28%', onboardedToday: false },
        { id: '4', name: 'Sarah Williams', email: 'sarah@techmart.com', merchant: 'TechMart Ltd', status: 'ACTIVE', devicesAssigned: 6, overdueRate: '8%', onboardedToday: false },
        { id: '5', name: 'David Brown', email: 'david@phoneplus.com', merchant: 'PhonePlus Inc', status: 'ACTIVE', devicesAssigned: 10, overdueRate: '22%', onboardedToday: false },
    ];

    const handleSuspend = (agentId: string, agentName: string) => {
        const reason = prompt(`Suspend ${agentName}? Enter reason for audit log:`);
        if (reason) {
            alert(`Agent ${agentName} suspended. Reason: ${reason}`);
            // TODO: Call API to suspend agent
        }
    };

    const handleEscalate = (agentId: string, agentName: string) => {
        const department = prompt(`Escalate ${agentName} to Risk or Compliance? (Enter: RISK or COMPLIANCE)`);
        if (department) {
            alert(`Agent ${agentName} escalated to ${department} team.`);
            // TODO: Call API to create escalation ticket
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Agent Activity Monitor</h2>
                <p className="text-muted-foreground">Operational oversight of merchant agents</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            Total Agents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{agents.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <UserMinus className="h-4 w-4 text-red-500" />
                            Suspended
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{agents.filter(a => a.status === 'SUSPENDED').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            High Overdue Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{agents.filter(a => parseInt(a.overdueRate) > 20).length}</div>
                        <p className="text-xs text-muted-foreground">&gt; 20% overdue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-green-500" />
                            Onboarded Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{agents.filter(a => a.onboardedToday).length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Agent Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Agent Activity List</CardTitle>
                    <CardDescription>Monitor agent performance and take action</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Agent</TableHead>
                                    <TableHead>Merchant</TableHead>
                                    <TableHead>Devices</TableHead>
                                    <TableHead>Overdue Rate</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {agents.map((agent) => (
                                    <TableRow key={agent.id}>
                                        <TableCell>
                                            <div className="font-medium">{agent.name}</div>
                                            <div className="text-xs text-muted-foreground">{agent.email}</div>
                                        </TableCell>
                                        <TableCell>{agent.merchant}</TableCell>
                                        <TableCell>{agent.devicesAssigned}</TableCell>
                                        <TableCell>
                                            <span className={parseInt(agent.overdueRate) > 20 ? 'text-red-600 font-bold' : parseInt(agent.overdueRate) > 10 ? 'text-yellow-600' : 'text-green-600'}>
                                                {agent.overdueRate}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={agent.status === 'ACTIVE' ? 'default' : 'destructive'}>
                                                {agent.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {agent.status === 'ACTIVE' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1"
                                                        onClick={() => handleSuspend(agent.id, agent.name)}
                                                    >
                                                        <Ban className="h-3 w-3" />
                                                        Suspend
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEscalate(agent.id, agent.name)}
                                                >
                                                    Escalate
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
