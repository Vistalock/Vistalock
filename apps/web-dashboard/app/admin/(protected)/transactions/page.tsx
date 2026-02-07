'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, ServerCrash, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

export default function OpsTransactionsPage() {
    // Mock transaction flow data
    const transactions = [
        { id: '1', timestamp: '2026-02-07 20:15:32', type: 'BNPL_INIT', merchant: 'TechMart Ltd', amount: '₦45,000', status: 'SUCCESS', partner: 'Carbon', latency: '1.2s' },
        { id: '2', timestamp: '2026-02-07 20:14:18', type: 'LOAN_CREATE', merchant: 'PhonePlus Inc', amount: '₦32,000', status: 'SUCCESS', partner: 'FairMoney', latency: '0.8s' },
        { id: '3', timestamp: '2026-02-07 20:12:45', type: 'BNPL_INIT', merchant: 'MobileHub', amount: '₦28,500', status: 'FAILED', partner: 'Carbon', latency: '5.2s' },
        { id: '4', timestamp: '2026-02-07 20:10:03', type: 'SETTLEMENT', merchant: 'TechMart Ltd', amount: '₦15,000', status: 'PENDING', partner: 'Paystack', latency: '2.1s' },
        { id: '5', timestamp: '2026-02-07 20:08:22', type: 'LOAN_CREATE', merchant: 'PhonePlus Inc', amount: '₦52,000', status: 'SUCCESS', partner: 'Carbon', latency: '1.5s' },
    ];

    const apiHealth = [
        { partner: 'Carbon', status: 'OPERATIONAL', uptime: '99.8%', avgLatency: '1.2s', failedCalls: 3 },
        { partner: 'FairMoney', status: 'OPERATIONAL', uptime: '99.5%', avgLatency: '0.9s', failedCalls: 1 },
        { partner: 'Paystack', status: 'DEGRADED', uptime: '97.2%', avgLatency: '3.1s', failedCalls: 12 },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Transaction Flow Monitor</h2>
                <p className="text-muted-foreground">Monitor BNPL pipeline health and loan partner API status</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            Total Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,247</div>
                        <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Successful
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">1,189</div>
                        <p className="text-xs text-muted-foreground">95.3% success rate</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <ServerCrash className="h-4 w-4 text-red-500" />
                            Failed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">58</div>
                        <p className="text-xs text-muted-foreground">4.7% failure rate</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            Avg Latency
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1.4s</div>
                        <p className="text-xs text-muted-foreground">Within SLA</p>
                    </CardContent>
                </Card>
            </div>

            {/* Loan Partner API Health */}
            <Card>
                <CardHeader>
                    <CardTitle>Loan Partner API Health</CardTitle>
                    <CardDescription>Real-time status of external loan partners</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Partner</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Uptime (24h)</TableHead>
                                    <TableHead>Avg Latency</TableHead>
                                    <TableHead>Failed Calls</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {apiHealth.map((partner) => (
                                    <TableRow key={partner.partner}>
                                        <TableCell className="font-medium">{partner.partner}</TableCell>
                                        <TableCell>
                                            <Badge variant={partner.status === 'OPERATIONAL' ? 'default' : 'destructive'}>
                                                {partner.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{partner.uptime}</TableCell>
                                        <TableCell>{partner.avgLatency}</TableCell>
                                        <TableCell>
                                            <span className={partner.failedCalls > 10 ? 'text-red-600 font-bold' : ''}>
                                                {partner.failedCalls}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transaction Log */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transaction Log</CardTitle>
                    <CardDescription>Last 100 BNPL transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Merchant</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Partner</TableHead>
                                    <TableHead>Latency</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((txn) => (
                                    <TableRow key={txn.id}>
                                        <TableCell className="text-xs font-mono">{txn.timestamp}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{txn.type}</Badge>
                                        </TableCell>
                                        <TableCell>{txn.merchant}</TableCell>
                                        <TableCell className="font-medium">{txn.amount}</TableCell>
                                        <TableCell>{txn.partner}</TableCell>
                                        <TableCell className={txn.latency.startsWith('5') ? 'text-red-600 font-bold' : ''}>
                                            {txn.latency}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={txn.status === 'SUCCESS' ? 'default' : txn.status === 'FAILED' ? 'destructive' : 'secondary'}>
                                                {txn.status}
                                            </Badge>
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
