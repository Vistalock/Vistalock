/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge'; // Removed used inline component instead



import { CreateLoanModal } from '@/components/loans/create-loan-modal';
import { RepayModal } from '@/components/loans/repay-modal';

// Using simple span for badge style to assume less deps
function StatusBadge({ status }: { status: string }) {
    const styles = {
        LOCKED: 'bg-red-100 text-red-800',
        UNLOCKED: 'bg-green-100 text-green-800',
        PENDING_SETUP: 'bg-yellow-100 text-yellow-800',
    };
    const className = styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}>
            {status}
        </span>
    );
}

export default function DevicesPage() {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [createLoanDevice, setCreateLoanDevice] = useState<{ id: string, merchantId: string } | null>(null);
    const [repayLoanId, setRepayLoanId] = useState<string | null>(null);

    const fetchDevices = async () => {
        try {
            const res = await api.get('/devices');
            setDevices(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Failed to fetch devices', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleToggleLock = async (imei: string, currentStatus: string) => {
        const action = currentStatus === 'LOCKED' ? 'unlock' : 'lock';
        try {
            await api.patch(`/devices/${imei}/${action}`);
            fetchDevices(); // Refresh list
        } catch (error) {
            console.error('Failed to update device', error);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Device Management</h1>
                <Button onClick={() => fetchDevices()}>Refresh</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Devices</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4">Loading devices...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>IMEI</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Loan Status</TableHead>
                                    <TableHead>Last Heartbeat</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {devices.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">No devices found.</TableCell>
                                    </TableRow>
                                )}
                                {devices.map((device) => {
                                    const activeLoan = device.loans && device.loans.length > 0 ? device.loans[0] : null;
                                    return (
                                        <TableRow key={device.id}>
                                            <TableCell className="font-mono">{device.imei}</TableCell>
                                            <TableCell>{device.model || 'Unknown'}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={device.status} />
                                            </TableCell>
                                            <TableCell>
                                                {activeLoan ? (
                                                    <span className="text-blue-600 font-medium text-xs">Active (₦{activeLoan.amount})</span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No Loan</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {device.lastHeartbeat ? new Date(device.lastHeartbeat).toLocaleString() : 'Never'}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {activeLoan ? (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setRepayLoanId(activeLoan.id)}
                                                    >
                                                        Repay
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCreateLoanDevice({ id: device.id, merchantId: device.merchantId })}
                                                    >
                                                        Add Loan
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={device.status === 'LOCKED' ? 'text-green-600' : 'text-red-600'}
                                                    onClick={() => handleToggleLock(device.imei, device.status)}
                                                >
                                                    {device.status === 'LOCKED' ? 'Unlock' : 'Lock'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {createLoanDevice && (
                <CreateLoanModal
                    isOpen={!!createLoanDevice}
                    onClose={() => setCreateLoanDevice(null)}
                    deviceId={createLoanDevice.id}

                    onSuccess={fetchDevices}
                />
            )}

            {repayLoanId && (
                <RepayModal
                    isOpen={!!repayLoanId}
                    onClose={() => setRepayLoanId(null)}
                    loanId={repayLoanId}
                    onSuccess={fetchDevices}
                />
            )}
        </div>
    );
}

