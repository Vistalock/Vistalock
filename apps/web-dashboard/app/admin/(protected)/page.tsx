/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Shield, Lock, FileWarning, Loader2 } from 'lucide-react';

export default function AdminPage() {
    const [stats, setStats] = useState({
        totalMerchants: 0,
        totalDevices: 0,
        lockedDevices: 0,
        activeLoans: 0,
        totalRevenue: 0
    });
    const [recentMerchants, setRecentMerchants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const [statsRes, merchantsRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin/merchants`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                setStats(statsRes.data);
                // Sort by joinedAt desc if not already sorted by backend
                const sorted = Array.isArray(merchantsRes.data)
                    ? merchantsRes.data.sort((a: any, b: any) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
                    : [];
                setRecentMerchants(sorted.slice(0, 5));
            } catch (e) {
                console.error("Failed to fetch dashboard data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">


            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Merchants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMerchants}</div>
                        <p className="text-xs text-muted-foreground">Registered partners</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDevices}</div>
                        <p className="text-xs text-muted-foreground">Total fleet size</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Locked Devices</CardTitle>
                        <Lock className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.lockedDevices}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalDevices > 0 ? ((stats.lockedDevices / stats.totalDevices) * 100).toFixed(1) : 0}% of fleet locked
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <FileWarning className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Lifetime transaction volume</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Merchant Signups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentMerchants.length === 0 && <div className="text-muted-foreground text-sm">No recent signups.</div>}
                            {recentMerchants.map((merchant) => (
                                <div key={merchant.id} className="flex items-center">
                                    <div className="bg-primary/10 w-9 h-9 rounded-full flex items-center justify-center mr-4 font-bold text-primary">
                                        {merchant.businessName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{merchant.businessName}</p>
                                        <p className="text-sm text-muted-foreground">{merchant.email}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm text-muted-foreground">
                                        {new Date(merchant.joinedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                        <CardDescription>Real-time service status check.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">API Gateway</p>
                                    <p className="text-xs text-muted-foreground">Uptime: 99.9%</p>
                                </div>
                                <div className="text-sm font-medium text-green-600">Operational</div>
                            </div>
                            <div className="flex items-center">
                                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Database</p>
                                    <p className="text-xs text-muted-foreground">Connections: Optimal</p>
                                </div>
                                <div className="text-sm font-medium text-green-600">Operational</div>
                            </div>
                            <div className="flex items-center">
                                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Locking Service</p>
                                    <p className="text-xs text-muted-foreground">Latency: 24ms</p>
                                </div>
                                <div className="text-sm font-medium text-green-600">Operational</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
