"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Wallet, CreditCard, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function WalletPage() {
    const PARTNER_ID = "4ac9f212-46d5-4602-b8d6-797c95c1179d";

    const { data: wallet, isLoading } = useQuery({
        queryKey: ['partner-wallet'],
        queryFn: async () => {
            const res = await api.get(`/loan-partner-api/wallet?partnerId=${PARTNER_ID}`);
            return res.data;
        }
    });

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    const balance = Number(wallet?.balance || 0);
    const ledgerBalance = Number(wallet?.ledgerBalance || 0);
    const transactions = wallet?.transactions || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Wallet & Funding</h1>
                    <p className="text-sm text-gray-500">Manage your capital and view transaction history</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <ArrowDownLeft className="mr-2 h-4 w-4" />
                        Withdraw
                    </Button>
                    <Button>
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Add Funds
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Capital</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
                        <p className="text-xs text-muted-foreground">Ledger Balance: {formatCurrency(ledgerBalance)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deployed</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(8500000)}</div> {/* Mock fallback for now */}
                        <p className="text-xs text-muted-foreground">Across 45 active loans</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(450000)}</div>
                        <p className="text-xs text-muted-foreground">Interest + Commissions</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction Ledger</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No recent transactions found.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Reference</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                    <th className="px-6 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx: any) => (
                                    <tr key={tx.id} className="bg-white border-b">
                                        <td className="px-6 py-4">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{tx.type}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{tx.reference}</td>
                                        <td className={`px-6 py-4 text-right font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">{tx.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
