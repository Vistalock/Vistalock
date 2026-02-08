/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';

interface ProductFormModalProps {
    product: any | null;
    onClose: () => void;
}

export function ProductFormModal({ product, onClose }: ProductFormModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        model: '',
        osType: 'Android' as 'Android' | 'iOS',
        retailPrice: '',
        bnplEligible: true,
        maxTenureMonths: 6,
        downPayment: '',
        lockSupport: true,
        status: 'active' as 'active' | 'inactive',
        stockQuantity: '',
        loanPartnerId: '',
    });
    const [loanPartners, setLoanPartners] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                brand: product.brand || '',
                model: product.model || '',
                osType: product.osType || 'Android',
                retailPrice: product.retailPrice?.toString() || '',
                bnplEligible: product.bnplEligible ?? true,
                maxTenureMonths: product.maxTenureMonths || 6,
                downPayment: product.downPayment?.toString() || '',
                lockSupport: product.lockSupport ?? true,
                setLoading(true);

        try {
                    const payload = {
                        ...formData,
                        retailPrice: parseFloat(formData.retailPrice),
                        downPayment: formData.downPayment ? parseFloat(formData.downPayment) : null,
                        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : null,
                    };

                    if(product) {
                        await api.patch(`/products/${product.id}`, payload);
                    } else {
                        await api.post('/products', payload);
                    }

            onClose();
                } catch(err: any) {
                    setError(err.response?.data?.message || 'Failed to save product');
                } finally {
                    setLoading(false);
                }
            };

            return (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-2xl font-bold">
                                {product ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Basic Information</h3>

                                <div>
                                    <Label htmlFor="name" className="mb-2 block">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Samsung Galaxy A15"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="brand" className="mb-2 block">Brand *</Label>
                                        <Input
                                            id="brand"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            placeholder="e.g. Samsung"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="model" className="mb-2 block">Model *</Label>
                                        <Input
                                            id="model"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            placeholder="e.g. A15"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="osType" className="mb-2 block">Operating System *</Label>
                                    <Select
                                        value={formData.osType}
                                        onValueChange={(value: 'Android' | 'iOS') => setFormData({ ...formData, osType: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Android">Android</SelectItem>
                                            <SelectItem value="iOS">iOS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Pricing</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="retailPrice" className="mb-2 block">Retail Price (₦) *</Label>
                                        <Input
                                            id="retailPrice"
                                            type="number"
                                            step="0.01"
                                            value={formData.retailPrice}
                                            onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="downPayment" className="mb-2 block">Down Payment (₦)</Label>
                                        <Input
                                            id="downPayment"
                                            type="number"
                                            step="0.01"
                                            value={formData.downPayment}
                                            onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* BNPL Settings */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">BNPL Settings</h3>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>BNPL Eligible</Label>
                                        <p className="text-sm text-muted-foreground">Allow this product for BNPL sales</p>
                                    </div>
                                    <Switch
                                        checked={formData.bnplEligible}
                                        onCheckedChange={(checked) => setFormData({ ...formData, bnplEligible: checked })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="maxTenure" className="mb-2 block">Max Tenure (Months)</Label>
                                    <Select
                                        value={formData.maxTenureMonths.toString()}
                                        onValueChange={(value) => setFormData({ ...formData, maxTenureMonths: parseInt(value) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((months) => (
                                                <SelectItem key={months} value={months.toString()}>
                                                    {months} {months === 1 ? 'month' : 'months'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Lock Support</Label>
                                        <p className="text-sm text-muted-foreground">Required for BNPL</p>
                                    </div>
                                    <Switch
                                        checked={formData.lockSupport}
                                        onCheckedChange={(checked) => setFormData({ ...formData, lockSupport: checked })}
                                    />
                                </div>


                                <div>
                                    <Label htmlFor="loanPartner" className="mb-2 block">Financing Partner</Label>
                                    <Select
                                        value={formData.loanPartnerId}
                                        onValueChange={(value) => setFormData({ ...formData, loanPartnerId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a Partner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loanPartners.map((partner) => (
                                                <SelectItem key={partner.id} value={partner.id}>
                                                    {partner.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Which entity funds this product's loans?
                                    </p>
                                </div>
                            </div>

                            {/* Inventory */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Inventory (Optional)</h3>

                                <div>
                                    <Label htmlFor="stockQuantity" className="mb-2 block">Stock Quantity</Label>
                                    <Input
                                        id="stockQuantity"
                                        type="number"
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Availability</h3>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Status</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {formData.status === 'active' ? 'Visible to agents' : 'Hidden from agents'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.status === 'active'}
                                        onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }
