/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from 'axios';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin/audit`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLogs(res.data);
            } catch (error) {
                console.error("Failed to fetch logs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) return <div>Loading audit logs...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Audit Logs</CardTitle>
                <CardDescription>Track all sensitive actions performed within the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Timestamp</th>
                                <th className="px-4 py-3 font-medium">Actor</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Action</th>
                                <th className="px-4 py-3 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No logs found.</td>
                                </tr>
                            )}
                            {Array.isArray(logs) && logs.map((log) => (
                                <tr key={log.id} className="border-t hover:bg-muted/50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">{log.actor}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{log.role}</span>
                                    </td>
                                    <td className="px-4 py-3 font-medium">{log.action}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                        {log.details ? JSON.stringify(log.details) : '-'}
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
