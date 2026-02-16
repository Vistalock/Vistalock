"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Lock, Unlock } from "lucide-react";
import { useState } from "react";

// Helper for status badge style
const getDeviceStatusBadge = (status: string) => {
    switch (status) {
        case 'UNLOCKED':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><Unlock className="w-3 h-3 mr-1" /> Unlocked</Badge>;
        case 'LOCKED':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function DevicesPage() {
    const [search, setSearch] = useState("");

    const { data: devices, isLoading, error } = useQuery({
        queryKey: ['devices'],
        queryFn: async () => {
            const res = await api.get('/loan-partner-api/devices');
            return res.data;
        }
    });

    const filteredDevices = devices?.filter((device: any) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            device.imei.toLowerCase().includes(searchLower) ||
            device.model.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Devices</h1>
                    <p className="text-sm text-gray-500">Monitor funded devices and their lock status</p>
                </div>
            </div>

            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search by IMEI or Model..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="sm:w-auto">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Model</TableHead>
                                    <TableHead>IMEI</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Enrollment Date</TableHead>
                                    <TableHead className="text-right">Collateral Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><div className="h-4 w-32 bg-gray-100 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-4 w-32 bg-gray-100 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-6 w-24 bg-gray-100 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-gray-100 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-4 w-20 bg-gray-100 rounded animate-pulse ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredDevices?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            No devices found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDevices?.map((device: any) => (
                                        <TableRow key={device.id}>
                                            <TableCell className="font-medium">{device.model}</TableCell>
                                            <TableCell className="font-mono text-xs">{device.imei}</TableCell>
                                            <TableCell>{getDeviceStatusBadge(device.status)}</TableCell>
                                            <TableCell>{new Date(device.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {/* Collateral value usually matches pure device value or loan amount */}
                                                TODO
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
