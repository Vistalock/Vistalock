"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Store } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function FeatureCatalogAdmin() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { toast } = useToast();

    const { data: features, isLoading } = useQuery({
        queryKey: ['admin-features-catalog'],
        queryFn: async () => {
            // Simulation
            await new Promise(resolve => setTimeout(resolve, 700));
            return [
                { id: '1', name: 'Advanced Analytics', category: 'ANALYTICS', price: 5000, pricingType: 'MONTHLY', subscriptions: 12, isActive: true },
                { id: '2', name: 'Priority Support', category: 'SUPPORT', price: 15000, pricingType: 'MONTHLY', subscriptions: 5, isActive: true },
                { id: '3', name: 'API Access', category: 'INTEGRATION', price: 0, pricingType: 'FREE', subscriptions: 45, isActive: true },
            ];
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Feature Catalog</h3>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Feature
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Feature Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Active Subs</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : features?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No features defined</TableCell>
                            </TableRow>
                        ) : (
                            features?.map((feature: any) => (
                                <TableRow key={feature.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                                <Store className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium">{feature.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{feature.category}</Badge></TableCell>
                                    <TableCell>
                                        {feature.price === 0 ? 'Free' : `${formatCurrency(feature.price)} / ${feature.pricingType.toLowerCase()}`}
                                    </TableCell>
                                    <TableCell>{feature.subscriptions}</TableCell>
                                    <TableCell>
                                        <Badge variant={feature.isActive ? 'default' : 'secondary'}>
                                            {feature.isActive ? 'Active' : 'Inactive'}
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

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Feature</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                            <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ANALYTICS">Analytics</SelectItem>
                                    <SelectItem value="SUPPORT">Support</SelectItem>
                                    <SelectItem value="INTEGRATION">Integration</SelectItem>
                                    <SelectItem value="SECURITY">Security</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input id="price" type="number" className="col-span-3" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                            toast({ title: "Feature Created", description: "Feature added to catalog" });
                            setIsCreateOpen(false);
                        }}>Save</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
