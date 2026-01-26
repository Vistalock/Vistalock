
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleModal } from '@/components/ui/simple-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    deviceId: string;
    onSuccess: () => void;
}

export function CreateLoanModal({ isOpen, onClose, deviceId, onSuccess }: CreateLoanModalProps) {
    const { user } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [amount, setAmount] = useState(''); // Down Payment
    const [tenure, setTenure] = useState('3');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/loans', {
                customerId,
                productId: selectedProductId,
                deviceId,
                downPayment: parseFloat(amount),
                tenureMonths: parseInt(tenure)
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to create loan', error);
            alert(error.response?.data?.message || 'Failed to create loan');
        } finally {
            setLoading(false);
        }
    };

    const selectedProduct = products.find(p => p.id === selectedProductId);

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title="Create BNPL Loan">
            <form onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-2">
                    <Label htmlFor="customer">Customer ID</Label>
                    <Input
                        id="customer"
                        placeholder="UUID of Customer"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="product">Select Product</Label>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose a product..." />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.name} - ₦{p.price.toLocaleString()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedProduct && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded border">
                        <p>Min Down Payment: ₦{selectedProduct.minDownPayment.toLocaleString()}</p>
                        <p>Tenure: {selectedProduct.minTenure} - {selectedProduct.maxTenure} months</p>
                        <p>Interest: {selectedProduct.interestRate}% monthly</p>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="downPayment">Down Payment (NGN)</Label>
                    <Input
                        id="downPayment"
                        type="number"
                        placeholder="Enter amount paid"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tenure">Tenure (Months)</Label>
                    <Input
                        id="tenure"
                        type="number"
                        min={selectedProduct?.minTenure || 1}
                        max={selectedProduct?.maxTenure || 12}
                        value={tenure}
                        onChange={(e) => setTenure(e.target.value)}
                        required
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={loading || !selectedProductId}>
                        {loading ? 'Processing...' : 'Create Loan'}
                    </Button>
                </div>
            </form>
        </SimpleModal>
    );
}
