'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Lock, Unlock, AlertTriangle } from 'lucide-react';

export function DeviceOperationsPanel() {
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data
    const devices = [
        { id: '1', name: 'Samsung A14', imei: '...4582', merchant: 'Merchant A', status: 'LOCKED', lastHeartbeat: '2 mins ago', loanStatus: 'Active' },
        { id: '2', name: 'Infinix Hot 30', imei: '...9921', merchant: 'Merchant B', status: 'UNLOCKED', lastHeartbeat: '5 mins ago', loanStatus: 'Active' },
        { id: '3', name: 'Tecno Spark 10', imei: '...1123', merchant: 'Merchant C', status: 'PENDING', lastHeartbeat: '24h ago', loanStatus: 'Defaulted' },
        { id: '4', name: 'Redmi 12C', imei: '...7744', merchant: 'Merchant A', status: 'LOCKED', lastHeartbeat: 'Offline', loanStatus: 'Active' },
        { id: '5', name: 'Nokia C30', imei: '...3322', merchant: 'Merchant D', status: 'UNLOCKED', lastHeartbeat: '1 hour ago', loanStatus: 'Completed' },
    ];

    const filteredDevices = devices.filter(d =>
        (filterStatus === 'ALL' || d.status === filterStatus) &&
        (d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.imei.includes(searchQuery))
    );

    return (
        <Card className="col-span-1 border-t-4 border-t-blue-500 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            📱 Device Operations Panel
                        </CardTitle>
                        <CardDescription>Real-time fleet control and monitoring.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder="Search Device / IMEI..."
                        className="max-w-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select defaultValue="ALL" onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="LOCKED">Locked</SelectItem>
                            <SelectItem value="UNLOCKED">Unlocked</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Device</TableHead>
                                <TableHead>Merchant</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Heartbeat</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDevices.map((device) => (
                                <TableRow key={device.id}>
                                    <TableCell>
                                        <div className="font-medium">{device.name}</div>
                                        <div className="text-xs text-muted-foreground">{device.imei}</div>
                                    </TableCell>
                                    <TableCell>{device.merchant}</TableCell>
                                    <TableCell>
                                        <Badge variant={device.status === 'LOCKED' ? 'destructive' : device.status === 'UNLOCKED' ? 'default' : 'secondary'}>
                                            {device.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className={`text-xs ${device.lastHeartbeat.includes('ago') ? 'text-green-600' : 'text-red-500 font-bold'}`}>
                                            {device.lastHeartbeat}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {device.status === 'LOCKED' ? (
                                                <Button size="icon" variant="ghost" title="Retry Unlock">
                                                    <Unlock className="h-4 w-4 text-green-600" />
                                                </Button>
                                            ) : (
                                                <Button size="icon" variant="ghost" title="Retry Lock">
                                                    <Lock className="h-4 w-4 text-red-600" />
                                                </Button>
                                            )}
                                            <Button size="icon" variant="ghost" title="Flag Unstable">
                                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
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
    );
}
