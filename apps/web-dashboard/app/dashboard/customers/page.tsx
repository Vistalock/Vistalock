'use client';

import { useEffect, useState } from 'react';
import { CustomerProfileModal } from "@/components/customers/customer-profile-modal";
import { api } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Search } from "lucide-react";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                // Fetch loans for this merchant
                const res = await api.get('/loans'); // api lib automatically handles merchantId filtering if token present? No, controller expects query param.
                // Actually, let's use the explicit query param as per controller change, but api lib might not inject it.
                // Wait, previous `page.tsx` decoded token to get merchantId. Let's keep that logic or rely on backend.
                // Backend `findAll(@Query('merchantId') merchantId?: string)`
                // The API lib attaches the token. The backend controller (LoanController) 
                // extracts user from request? No, it expects query param.
                // We should probably decode token here or better: Update backend to extract merchantId from token if not provided?
                // For now, let's stick to the working pattern: Decode token -> pass param.

                const token = localStorage.getItem('token');
                if (!token) return;
                const decoded: any = jwtDecode(token);
                const merchantId = decoded.sub;

                const loansRes = await api.get(`/loans?merchantId=${merchantId}`);
                const loans = loansRes.data;

                // Group by userId for Customer Profile
                const grouped = loans.reduce((acc: any, loan: any) => {
                    if (!acc[loan.userId]) {
                        acc[loan.userId] = {
                            userId: loan.userId,
                            loans: [],
                            phone: '080-XXXX-XXXX', // Mock
                            kycStatus: 'VERIFIED'   // Mock
                        };
                    }
                    acc[loan.userId].loans.push(loan);
                    return acc;
                }, {});

                const customerList = Object.values(grouped).map((c: any) => {
                    const activeLoan = c.loans.find((l: any) => l.status === 'ACTIVE');
                    return {
                        ...c,
                        activeLoans: c.loans.filter((l: any) => l.status === 'ACTIVE').length,
                        deviceStatus: activeLoan ? 'Active' : 'N/A'
                    };
                });

                setCustomers(customerList);

            } catch (error) {
                console.error('Failed to fetch customers', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customer Management</h1>
                    <p className="text-muted-foreground">View and manage your BNPL customers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by name, ID..."
                            className="pl-8 w-[250px]"
                        />
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Customer List</CardTitle>
                    <CardDescription>All customers currently enrolled in financing programs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>KYC Status</TableHead>
                                <TableHead>Active Loans</TableHead>
                                <TableHead>Device Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Loading customers...
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && customers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {customers.map((cust) => (
                                <TableRow key={cust.userId}>
                                    <TableCell className="font-mono text-xs">{cust.userId.substring(0, 8)}...</TableCell>
                                    <TableCell>{cust.phone}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{cust.kycStatus}</span>
                                    </TableCell>
                                    <TableCell>{cust.activeLoans}</TableCell>
                                    <TableCell>{cust.deviceStatus}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(cust)}>
                                            View Profile
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CustomerProfileModal
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                customer={selectedCustomer}
            />
        </div>
    );
}
