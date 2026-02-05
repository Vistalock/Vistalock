/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Smartphone, Lock, Unlock } from 'lucide-react';

interface Device {
    id: string;
    imei: string;
    model: string;
    status: 'LOCKED' | 'UNLOCKED' | 'PENDING_SETUP';
    lastHeartbeat: string | null;
    loans: {
        status: string;
        outstandingAmount: number;
    }[];
    merchant: {
        merchantProfile: {
            businessName: string;
        } | null;
    };
}

export default function PartnerDevices() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const res = await api.get('/loan-partners/devices');
                setDevices(res.data);
            } catch (error) {
                console.error('Failed to fetch devices:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    const filteredDevices = devices.filter(device =>
        device.imei.includes(searchTerm) ||
        device.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Device Assets</h1>
                <p className="text-muted-foreground">Monitor device health and lock status across your portfolio</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Funded Devices</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search IMEI or Model"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading devices...</div>
                    ) : devices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No devices found.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Device Info</TableHead>
                                    <TableHead>IMEI</TableHead>
                                    <TableHead>Merchant</TableHead>
                                    <TableHead>Lock Status</TableHead>
                                    <TableHead>Active Loan</TableHead>
                                    <TableHead>Last Heartbeat</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDevices.map((device) => {
                                    const activeLoan = device.loans[0];
                                    return (
                                        <TableRow key={device.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{device.model || 'Unknown Model'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{device.imei}</TableCell>
                                            <TableCell>
                                                {device.merchant.merchantProfile?.businessName || 'Unknown'}
                                            </TableCell>
                                            <TableCell>
                                                {device.status === 'LOCKED' ? (
                                                    <Badge variant="destructive" className="flex w-fit gap-1">
                                                        <Lock className="h-3 w-3" /> Locked
                                                    </Badge>
                                                ) : device.status === 'UNLOCKED' ? (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 flex w-fit gap-1">
                                                        <Unlock className="h-3 w-3" /> Unlocked
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Pending Setup</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {activeLoan ? (
                                                    <div className="flex flex-col text-sm">
                                                        <span className={activeLoan.status === 'DEFAULTED' ? 'text-red-500 font-semibold' : ''}>
                                                            {activeLoan.status}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ₦{activeLoan.outstandingAmount.toLocaleString()} Left
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No Active Loan</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {device.lastHeartbeat ? new Date(device.lastHeartbeat).toLocaleString() : 'Never'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
