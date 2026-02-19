'use client';

import { useState, useEffect } from 'react';
import { getPartnerDisputes, resolveDispute } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState<any>(null);
    const [resolutionNote, setResolutionNote] = useState('');
    const [isResolving, setIsResolving] = useState(false);

    const fetchDisputes = async () => {
        setIsLoading(true);
        try {
            const data = await getPartnerDisputes();
            setDisputes(data);
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const handleResolve = async (status: 'RESOLVED' | 'REJECTED') => {
        if (!selectedDispute) return;
        setIsResolving(true);
        try {
            await resolveDispute(selectedDispute.id, resolutionNote, status);
            toast({
                title: "Success",
                description: `Dispute marked as ${status.toLowerCase()}.`,
            });
            setOpenDialog(false);
            fetchDisputes();
        } catch (error) {
            console.error('Failed to resolve dispute:', error);
            toast({
                title: "Error",
                description: "Failed to update dispute.",
                variant: "destructive",
            });
        } finally {
            setIsResolving(false);
        }
    };

    const openResolutionDialog = (dispute: any) => {
        setSelectedDispute(dispute);
        setResolutionNote('Review complete. ' + (dispute.paymentId ? 'Payment verified.' : ''));
        setOpenDialog(true);
    };

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Disputes & Appeals</CardTitle>
                    <CardDescription>Manage and resolve disputes raised by merchants.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : disputes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground mb-2">No active disputes</p>
                            <Button variant="outline" onClick={fetchDisputes}>Refresh</Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Merchant</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {disputes.map((dispute) => (
                                    <TableRow key={dispute.id}>
                                        <TableCell>{new Date(dispute.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{dispute.merchant?.merchantProfile?.businessName || 'Unknown'}</TableCell>
                                        <TableCell>{dispute.paymentId ? 'Payment' : 'Loan'}</TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px] truncate" title={dispute.description}>
                                                <span className="font-medium block">{dispute.reason}</span>
                                                <span className="text-xs text-muted-foreground">{dispute.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={dispute.status === 'OPEN' ? 'destructive' : dispute.status === 'RESOLVED' ? 'default' : 'secondary'}>
                                                {dispute.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW' ? (
                                                <Button size="sm" variant="outline" onClick={() => openResolutionDialog(dispute)}>
                                                    Review
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Closed</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolve Dispute</DialogTitle>
                        <DialogDescription>
                            Take action on this dispute. Provide a resolution note.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="note">Resolution Note</Label>
                            <Textarea
                                id="note"
                                value={resolutionNote}
                                onChange={(e) => setResolutionNote(e.target.value)}
                                placeholder="Enter details about the resolution..."
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => handleResolve('REJECTED')} disabled={isResolving} className="text-red-600 border-red-200 hover:bg-red-50">
                            {isResolving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject Dispute'}
                        </Button>
                        <Button onClick={() => handleResolve('RESOLVED')} disabled={isResolving} className='bg-green-600 hover:bg-green-700'>
                            {isResolving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resolve / Refund'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
