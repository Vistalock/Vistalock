/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { jwtDecode } from 'jwt-decode';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function ReportsPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/auth/analytics');
                setAnalytics(res.data);
            } catch (error) {
                console.error('Failed to fetch analytics', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const downloadReport = async (type: 'settlements' | 'loans') => {
        try {
            let data = [];
            let filename = '';

            // Re-fetch merchant ID for query params if needed
            const token = localStorage.getItem('token');
            if (!token) return;
            const decoded: any = jwtDecode(token);
            const merchantId = decoded.sub;

            if (type === 'settlements') {
                const res = await api.get('/auth/transactions');
                data = res.data.map((tx: any) => ({
                    Reference: tx.reference,
                    Date: new Date(tx.createdAt).toISOString(),
                    Amount: tx.amount,
                    Status: tx.status
                }));
                filename = `settlements_report_${new Date().toISOString().split('T')[0]}.csv`;
            } else {
                const res = await api.get(`/loans?merchantId=${merchantId}`);
                data = res.data.map((loan: any) => ({
                    LoanID: loan.id,
                    Amount: loan.amount,
                    Status: loan.status,
                    Duration: `${loan.durationMonths} months`,
                    StartDate: new Date(loan.startDate).toISOString(),
                    Interest: `${loan.interestRate}%`
                }));
                filename = `loan_performance_${new Date().toISOString().split('T')[0]}.csv`;
            }

            if (data.length === 0) {
                alert('No data available to export.');
                return;
            }

            // Convert to CSV
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map((row: any) => headers.map(header => JSON.stringify(row[header])).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export failed', error);
            alert('Failed to generate report.');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading reports...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Insights into device utilization and repayment performance.</p>
                </div>
                <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Last 30 Days
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Device Utilization Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Device Utilization</CardTitle>
                        <CardDescription>Active vs Locked devices distribution.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {analytics?.deviceUtilization ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.deviceUtilization}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analytics.deviceUtilization.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p className="text-center pt-20 text-muted-foreground">No data available</p>}
                    </CardContent>
                </Card>

                {/* Loan Performance Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Loan Performance</CardTitle>
                        <CardDescription>Active and Completed loans overview.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {analytics?.loanPerformance ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.loanPerformance}>
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-center pt-20 text-muted-foreground">No data available</p>}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Trend Mockup - Placeholder for future expansion */}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Export Data</CardTitle>
                    <CardDescription>Download detailed CSV reports for your records.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border p-4 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium">Monthly Settlement Report</h3>
                                <p className="text-sm text-muted-foreground">Detailed breakdown of all payouts.</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => downloadReport('settlements')}>
                            <Download className="mr-2 h-4 w-4" />
                            Download CSV
                        </Button>
                    </div>
                    <div className="flex items-center justify-between border p-4 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium">Loan Performance Report</h3>
                                <p className="text-sm text-muted-foreground">Status of all active and completed loans.</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => downloadReport('loans')}>
                            <Download className="mr-2 h-4 w-4" />
                            Download CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
