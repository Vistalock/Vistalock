'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Headphones, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function OpsSupportPage() {
    // Mock support tickets
    const tickets = [
        { id: 'TKT-1247', customer: 'John Customer', merchant: 'TechMart Ltd', category: 'Device Unlock', priority: 'HIGH', status: 'OPEN', sla: '45 mins', createdAt: '2026-02-07 19:30' },
        { id: 'TKT-1246', customer: 'Jane Buyer', merchant: 'PhonePlus Inc', category: 'Payment Issue', priority: 'MEDIUM', status: 'IN_PROGRESS', sla: '2 hrs', createdAt: '2026-02-07 18:15' },
        { id: 'TKT-1245', customer: 'Mike User', merchant: 'MobileHub', category: 'App Crash', priority: 'LOW', status: 'RESOLVED', sla: 'Met', createdAt: '2026-02-07 17:00' },
        { id: 'TKT-1244', customer: 'Sarah Client', merchant: 'TechMart Ltd', category: 'Device Lock', priority: 'CRITICAL', status: 'ESCALATED', sla: 'Breached', createdAt: '2026-02-07 16:45' },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Support & Tickets</h2>
                <p className="text-muted-foreground">First-line incident response and ticket management</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Headphones className="h-4 w-4 text-blue-500" />
                            Open Tickets
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'OPEN').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            In Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Escalated
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{tickets.filter(t => t.status === 'ESCALATED').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Resolved Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'RESOLVED').length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Ticket Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Ticket Queue</CardTitle>
                    <CardDescription>Manage customer support tickets with SLA tracking</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ticket ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Merchant</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>SLA</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                                        <TableCell>{ticket.customer}</TableCell>
                                        <TableCell>{ticket.merchant}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{ticket.category}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH' ? 'destructive' : ticket.priority === 'MEDIUM' ? 'secondary' : 'outline'}>
                                                {ticket.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={ticket.sla === 'Breached' ? 'text-red-600 font-bold' : ticket.sla === 'Met' ? 'text-green-600' : ''}>
                                                {ticket.sla}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={ticket.status === 'RESOLVED' ? 'default' : ticket.status === 'ESCALATED' ? 'destructive' : 'secondary'}>
                                                {ticket.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline">View</Button>
                                                {ticket.status !== 'RESOLVED' && ticket.status !== 'ESCALATED' && (
                                                    <Button size="sm" variant="ghost">Escalate</Button>
                                                )}
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
