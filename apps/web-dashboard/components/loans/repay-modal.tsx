
import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleModal } from '@/components/ui/simple-modal';

interface RepayModalProps {
    isOpen: boolean;
    onClose: () => void;
    loanId: string;
    onSuccess: () => void;
}

export function RepayModal({ isOpen, onClose, loanId, onSuccess }: RepayModalProps) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/loans/${loanId}/repay`, {
                amount: parseFloat(amount)
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to repay loan', error);
            alert('Repayment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title="Repay Loan">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Repayment Amount (NGN)</Label>
                    <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        required
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Processing...' : 'Submit Payment'}
                    </Button>
                </div>
            </form>
        </SimpleModal>
    );
}
