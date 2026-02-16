
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

interface CreateMerchantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    applicationId: string | null;
}

export function CreateMerchantModal({ isOpen, onClose, onSuccess, applicationId }: CreateMerchantModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [maxDevices, setMaxDevices] = useState(10);
    const [maxAgents, setMaxAgents] = useState(5);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!applicationId) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin/merchants/create-from-application/${applicationId}`,
                { password, maxDevices, maxAgents },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onSuccess();
            onClose();
            setPassword(''); // Reset sensitive data
        } catch (error) {
            console.error(error);
            alert('Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white text-black">
                <DialogHeader>
                    <DialogTitle>Create Merchant Account</DialogTitle>
                    <DialogDescription>
                        Set the initial credentials and package limits for this merchant.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Initial Password</Label>
                        <Input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="e.g. SecretMerch123!"
                            required
                            minLength={8}
                        />
                        <p className="text-xs text-muted-foreground">Share this securely with the merchant.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Max Devices</Label>
                            <Input
                                type="number"
                                value={maxDevices}
                                onChange={(e) => setMaxDevices(parseInt(e.target.value))}
                                min={1}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Agents</Label>
                            <Input
                                type="number"
                                value={maxAgents}
                                onChange={(e) => setMaxAgents(parseInt(e.target.value))}
                                min={1}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !password}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Account
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
