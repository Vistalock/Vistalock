'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanPartnerService, type LoanPartner } from '@/lib/services/loanPartnerService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, Edit, Trash2, Key, TestTube, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function LoanPartnersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch loan partners
    const { data: loanPartners = [], isLoading } = useQuery({
        queryKey: ['loanPartners'],
        queryFn: loanPartnerService.getAll,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: loanPartnerService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loanPartners'] });
            toast({
                title: 'Success',
                description: 'Loan partner deleted successfully',
            });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete loan partner',
                variant: 'destructive',
            });
        },
    });

    // Filter loan partners
    const filteredPartners = loanPartners.filter((partner) =>
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Copy API key
    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 2000);
        toast({
            title: 'Copied',
            description: 'API key copied to clipboard',
        });
    };

    // Mask API key
    const maskApiKey = (key: string) => {
        if (key.length <= 12) return key;
        return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Loan Partners</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your loan partner integrations and API credentials
                    </p>
                </div>
                <Link href="/dashboard/loan-partners/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Loan Partner
                    </Button>
                </Link>
            </div>

            {/* Search and Stats */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Loan Partners</CardTitle>
                            <CardDescription>
                                {filteredPartners.length} partner{filteredPartners.length !== 1 ? 's' : ''} found
                            </CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search partners..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-muted-foreground mt-4">Loading loan partners...</p>
                        </div>
                    ) : filteredPartners.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                {searchQuery ? 'No loan partners found matching your search' : 'No loan partners yet'}
                            </p>
                            {!searchQuery && (
                                <Link href="/dashboard/loan-partners/new">
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Your First Loan Partner
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>API Key</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPartners.map((partner) => (
                                    <TableRow key={partner.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {partner.logoUrl && (
                                                    <img
                                                        src={partner.logoUrl}
                                                        alt={partner.name}
                                                        className="h-8 w-8 rounded object-cover"
                                                    />
                                                )}
                                                <span>{partner.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">{partner.slug}</code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs">{maskApiKey(partner.apiKey)}</code>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(partner.apiKey, partner.id)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    {copiedKey === partner.id ? (
                                                        <Check className="h-3 w-3 text-success" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {partner.contactEmail ? (
                                                <div className="text-sm">
                                                    <div>{partner.contactEmail}</div>
                                                    {partner.contactPhone && (
                                                        <div className="text-muted-foreground">{partner.contactPhone}</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={partner.isActive ? 'default' : 'secondary'}>
                                                {partner.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <Link href={`/dashboard/loan-partners/${partner.id}`}>
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <Link href={`/dashboard/loan-partners/${partner.id}/credentials`}>
                                                        <DropdownMenuItem>
                                                            <Key className="h-4 w-4 mr-2" />
                                                            Manage Credentials
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <Link href={`/dashboard/loan-partners/${partner.id}/test`}>
                                                        <DropdownMenuItem>
                                                            <TestTube className="h-4 w-4 mr-2" />
                                                            Test Webhook
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(partner.id)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Loan Partner?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the loan partner and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
