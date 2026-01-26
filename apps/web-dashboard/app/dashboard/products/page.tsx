'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { ProductFormModal } from '@/components/products/product-form-modal';

interface Product {
    id: string;
    name: string;
    brand: string;
    model: string;
    osType: 'Android' | 'iOS';
    retailPrice: number;
    bnplEligible: boolean;
    maxTenureMonths: number;
    downPayment: number | null;
    lockSupport: boolean;
    status: 'active' | 'inactive';
    branchId: string | null;
    stockQuantity: number | null;
    createdAt: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [osFilter, setOsFilter] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm, statusFilter, osFilter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.model.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        // OS filter
        if (osFilter !== 'all') {
            filtered = filtered.filter(p => p.osType === osFilter);
        }

        setFilteredProducts(filtered);
    };

    const handleToggleStatus = async (product: Product) => {
        try {
            const newStatus = product.status === 'active' ? 'inactive' : 'active';
            await api.patch(`/products/${product.id}`, { status: newStatus });
            fetchProducts();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingProduct(null);
        fetchProducts();
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(price);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Products & Inventory</h1>
                    <p className="text-muted-foreground">Manage BNPL-eligible devices for your agents</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={osFilter} onValueChange={setOsFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="OS Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All OS</SelectItem>
                                <SelectItem value="Android">Android</SelectItem>
                                <SelectItem value="iOS">iOS</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading products...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No products found. Add your first product to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Brand/Model</TableHead>
                                    <TableHead>OS</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>BNPL</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.brand} {product.model}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{product.osType}</Badge>
                                        </TableCell>
                                        <TableCell>{formatPrice(product.retailPrice)}</TableCell>
                                        <TableCell>
                                            {product.bnplEligible ? (
                                                <Badge className="bg-green-500">Eligible</Badge>
                                            ) : (
                                                <Badge variant="secondary">Not Eligible</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {product.stockQuantity !== null ? product.stockQuantity : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={product.status === 'active'}
                                                    onCheckedChange={() => handleToggleStatus(product)}
                                                />
                                                <span className="text-sm">
                                                    {product.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(product)}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {showModal && (
                <ProductFormModal
                    product={editingProduct}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}
