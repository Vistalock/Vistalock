'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { User, Smartphone, CreditCard, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomerProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: any;
}

export function CustomerProfileModal({ isOpen, onClose, customer }: CustomerProfileModalProps) {
    if (!customer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer Profile
                    </DialogTitle>
                    <DialogDescription>
                        Detailed view of customer activity and assets.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 pt-2">
                    <div className="flex flex-col gap-6">
                        {/* Header Info */}
                        <div className="flex items-start justify-between bg-muted/50 p-4 rounded-lg">
                            <div>
                                <h3 className="text-lg font-bold">{customer.userId}</h3>
                                <p className="text-sm text-muted-foreground font-mono">ID: {customer.userId}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge variant={customer.kycStatus === 'VERIFIED' ? 'default' : 'secondary'}>
                                    KYC: {customer.kycStatus || 'UNKNOWN'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{customer.phone}</span>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Active Loans */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Loan History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {customer.loans && customer.loans.length > 0 ? (
                                        customer.loans.map((loan: any) => (
                                            <div key={loan.id} className="flex flex-col gap-1 border-b pb-2 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm">₦{Number(loan.amount).toLocaleString()}</span>
                                                    <Badge variant={loan.status === 'ACTIVE' ? 'default' : 'outline'} className="text-[10px]">
                                                        {loan.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>{loan.durationMonths} Months</span>
                                                    <span>Start: {new Date(loan.startDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No loans found.</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Devices */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Smartphone className="h-4 w-4" />
                                        Assigned Devices
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {customer.loans && customer.loans.some((l: any) => l.device) ? (
                                        customer.loans
                                            .filter((l: any) => l.device)
                                            .map((loan: any) => (
                                                <div key={loan.device.imei} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{loan.device.model || 'Device'}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">{loan.device.imei}</span>
                                                    </div>
                                                    <Badge variant={loan.device.status === 'LOCKED' ? 'destructive' : 'outline'} className="text-[10px]">
                                                        {loan.device.status}
                                                    </Badge>
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No devices linked.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
