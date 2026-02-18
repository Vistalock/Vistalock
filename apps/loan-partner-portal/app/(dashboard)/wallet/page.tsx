"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Wallet, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function WalletPage() {
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
                        <div className="text-2xl font-bold">{formatCurrency(2500000)}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deployed</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(8500000)}</div>
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
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Reference</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white border-b">
                                <td className="px-6 py-4">2026-02-18</td>
                                <td className="px-6 py-4 font-medium text-gray-900">Loan Disbursement</td>
                                <td className="px-6 py-4 font-mono text-xs">LN-10293</td>
                                <td className="px-6 py-4 text-right text-red-600">- ₦150,000</td>
                                <td className="px-6 py-4 text-right font-medium">₦2,500,000</td>
                            </tr>
                            <tr className="bg-white border-b">
                                <td className="px-6 py-4">2026-02-18</td>
                                <td className="px-6 py-4 font-medium text-gray-900">Repayment Received</td>
                                <td className="px-6 py-4 font-mono text-xs">PAY-9921</td>
                                <td className="px-6 py-4 text-right text-green-600">+ ₦12,500</td>
                                <td className="px-6 py-4 text-right font-medium">₦2,650,000</td>
                            </tr>
                            <tr className="bg-white border-b">
                                <td className="px-6 py-4">2026-02-17</td>
                                <td className="px-6 py-4 font-medium text-gray-900">Deposit (Bank Transfer)</td>
                                <td className="px-6 py-4 font-mono text-xs">DEP-0012</td>
                                <td className="px-6 py-4 text-right text-green-600">+ ₦1,000,000</td>
                                <td className="px-6 py-4 text-right font-medium">₦2,637,500</td>
                            </tr>
                            <tr className="bg-white border-b">
                                <td className="px-6 py-4">2026-02-17</td>
                                <td className="px-6 py-4 font-medium text-gray-900">Commission Payout</td>
                                <td className="px-6 py-4 font-mono text-xs">COM-1122</td>
                                <td className="px-6 py-4 text-right text-green-600">+ ₦45,000</td>
                                <td className="px-6 py-4 text-right font-medium">₦1,637,500</td>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
