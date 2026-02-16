"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function PricingTiersList() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: tiers, isLoading } = useQuery({
        queryKey: ['admin-pricing-tiers'],
        queryFn: async () => {
            // const res = await api.get('/admin/billing/pricing-tiers');
            // return res.data;

            // Simulation
            await new Promise(resolve => setTimeout(resolve, 600));
            return [
                { id: '1', name: 'Starter', minVolume: 0, maxVolume: 100, price: 1000, currency: 'NGN', isActive: true },
                { id: '2', name: 'Growth', minVolume: 101, maxVolume: 500, price: 800, currency: 'NGN', isActive: true },
                { id: '3', name: 'Scale', minVolume: 501, maxVolume: 10000, price: 600, currency: 'NGN', isActive: true },
            ];
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Pricing Tiers</h3>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tier
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tier Name</TableHead>
                            <TableHead>Volume Range</TableHead>
                            <TableHead>Price per Device</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : tiers?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No pricing tiers defined</TableCell>
                            </TableRow>
                        ) : (
                            tiers?.map((tier: any) => (
                                <TableRow key={tier.id}>
                                    <TableCell className="font-medium">{tier.name}</TableCell>
                                    <TableCell>{tier.minVolume} - {tier.maxVolume === 10000 ? 'Unlimited' : tier.maxVolume}</TableCell>
                                    <TableCell>{formatCurrency(tier.price)}</TableCell>
                                    <TableCell>
                                        <Badge variant={tier.isActive ? 'default' : 'secondary'}>
                                            {tier.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Dialog Placeholder */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Pricing Tier</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" defaultValue="Enterprise" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input id="price" type="number" defaultValue="500" className="col-span-3" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                            toast({ title: "Tier Created", description: "Pricing tier added successfully" });
                            setIsCreateOpen(false);
                        }}>Save</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
