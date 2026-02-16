"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Filter } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function MerchantBillingList() {
    const [search, setSearch] = useState("");

    const { data: merchants, isLoading } = useQuery({
        queryKey: ['admin-billing-merchants'],
        queryFn: async () => {
            // const res = await api.get('/admin/billing/merchants');
            // return res.data;

            // Simulation
            await new Promise(resolve => setTimeout(resolve, 800));
            return [
                { id: 1, name: "TechStore Ikeja", email: "store@techstore.com", balance: 500000, tier: "Gold", status: "ACTIVE" },
                { id: 2, name: "Gadget World", email: "info@gadgetworld.ng", balance: 12500, tier: "Silver", status: "WARNING" },
                { id: 3, name: "Iyke Phones", email: "iyke@phones.com", balance: -5000, tier: "Bronze", status: "SUSPENDED" },
                { id: 4, name: "Mobile Hub", email: "sales@mobilehub.com", balance: 250000, tier: "Platinum", status: "ACTIVE" },
            ];
        }
    });

    const filteredMerchants = merchants?.filter((m: any) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search merchants..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Merchant</TableHead>
                            <TableHead>Current Tier</TableHead>
                            <TableHead>Wallet Balance</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : filteredMerchants?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No merchants found</TableCell>
                            </TableRow>
                        ) : (
                            filteredMerchants?.map((merchant: any) => (
                                <TableRow key={merchant.id}>
                                    <TableCell>
                                        <div className="font-medium">{merchant.name}</div>
                                        <div className="text-xs text-muted-foreground">{merchant.email}</div>
                                    </TableCell>
                                    <TableCell>{merchant.tier}</TableCell>
                                    <TableCell>
                                        <div className={`font-bold ${merchant.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                            {formatCurrency(merchant.balance)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={merchant.status === 'ACTIVE' ? 'default' : 'destructive'}>
                                            {merchant.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
