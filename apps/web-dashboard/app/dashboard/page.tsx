'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smartphone, Users, AlertTriangle, Calendar, FileWarning, CheckCircle } from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>({
        totalDevices: 0,
        lockedDevices: 0,
        activeLoans: 0,
        totalRevenue: 0,
        gracePeriod: 0,
        repaymentsDue: 0,
        overdue: 0,
        defaultRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Endpoint patched to return merchant-specific stats for merchant users
                const res = await api.get('/auth/admin/stats');
                setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="flex flex-col gap-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDevices}</div>
                        <p className="text-xs text-muted-foreground">Active Fleet</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Locked Devices</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.lockedDevices}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Grace Period</CardTitle>
                        <Calendar className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.gracePeriod}</div>
                        <p className="text-xs text-muted-foreground">Due soon</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">BNPL Customers</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeLoans}</div>
                        <p className="text-xs text-muted-foreground">Active Loan Accounts</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦{Number(stats.totalRevenue).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total Collected</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <FileWarning className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">₦{Number(stats.overdue || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Missed Payments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Default Rate</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.defaultRate}%</div>
                        <p className="text-xs text-muted-foreground">Industry Avg: 5%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts & Notifications */}
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Real-time updates on device and loan status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { title: 'New Customer Onboarded', desc: 'Agent Akin registered John Doe (Samsung A13)', time: '2 mins ago', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
                                { title: 'Device Locked', desc: 'Ifeanyi Uche missed payment (Due: Yesterday)', time: '15 mins ago', icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
                                { title: 'Grace Period Entered', desc: '5 devices entered grace period today.', time: '1 hour ago', icon: <Calendar className="h-4 w-4 text-orange-500" /> },
                                { title: 'Repayment Received', desc: '₦15,000 processed for Loan #LN-2023-88', time: '2 hours ago', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
                                { title: 'Agent Login Suspicious', desc: 'Agent Sarah logged in from new IP.', time: '4 hours ago', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                            {item.icon}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{item.time}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alerts & Notifications</CardTitle>
                        <CardDescription>Critical items requiring attention.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-red-50 border-1 border-red-200 p-3 rounded-md flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-red-800">3 Failed Repayments</p>
                                    <p className="text-xs text-red-600">Retry auto-debit or contact customers manually.</p>
                                </div>
                            </div>
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-md flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-orange-800">12 Loans Expiring</p>
                                    <p className="text-xs text-orange-600">These loans are reaching max tenure this week.</p>
                                </div>
                            </div>
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-md flex items-start gap-3">
                                <FileWarning className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-yellow-800">Agent Performance</p>
                                    <p className="text-xs text-yellow-600">Agent 'Bola' is below weekly onboarding target.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
