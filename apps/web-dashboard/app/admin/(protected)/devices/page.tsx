/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import axios from 'axios';

// Device Status Badge
const StatusBadge = ({ status }: { status: string }) => {
    let color = 'bg-gray-100 text-gray-800';
    if (status === 'UNLOCKED') color = 'bg-green-100 text-green-800';
    if (status === 'LOCKED') color = 'bg-red-100 text-red-800';
    if (status === 'PENDING_SETUP') color = 'bg-yellow-100 text-yellow-800';

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {status}
        </span>
    );
};

export default function AdminDevicesPage() {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchDevices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:3000/devices`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDevices(res.data);
        } catch (error) {
            console.error("Failed to fetch devices", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleEmergencyAction = async (imei: string, action: 'lock' | 'unlock') => {
        const reason = prompt(`EMERGENCY ${action.toUpperCase()}: Please provide a reason for this audit log.`);
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3000/devices/${imei}/${action}`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Device ${action}ed successfully.`);
            fetchDevices();
        } catch (e) {
            alert(`Failed to ${action} device.`);
        }
    };

    const filteredDevices = devices.filter(d =>
        d.imei.includes(search) ||
        d.merchantId?.includes(search) || // In a real app we'd map this to names
        d.status.includes(search.toUpperCase())
    );

    if (loading) return <div>Loading devices...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Global Device Enforcement</CardTitle>
                <CardDescription>Monitor fleet status and perform emergency overrides.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <input
                        type="search"
                        placeholder="Search by IMEI or Merchant ID..."
                        className="w-full rounded-lg bg-background px-4 h-10 border text-sm outline-none focus:ring-2 focus:ring-primary/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">IMEI</th>
                                <th className="px-4 py-3 font-medium">Merchant ID</th>
                                <th className="px-4 py-3 font-medium">Model</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Emergency Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDevices.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No devices found.</td>
                                </tr>
                            )}
                            {filteredDevices.map((device) => (
                                <tr key={device.id} className="border-t hover:bg-muted/50">
                                    <td className="px-4 py-3 font-mono">{device.imei}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{device.merchantId}</td>
                                    <td className="px-4 py-3">{device.model || 'Unknown'}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={device.status} />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {device.status !== 'LOCKED' && (
                                                <button
                                                    onClick={() => handleEmergencyAction(device.imei, 'lock')}
                                                    className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 border border-red-200"
                                                    title="Emergency Lock"
                                                >
                                                    <Lock className="h-3 w-3" /> Lock
                                                </button>
                                            )}
                                            {device.status === 'LOCKED' && (
                                                <button
                                                    onClick={() => handleEmergencyAction(device.imei, 'unlock')}
                                                    className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 border border-green-200"
                                                    title="Emergency Unlock"
                                                >
                                                    <Unlock className="h-3 w-3" /> Unlock
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
