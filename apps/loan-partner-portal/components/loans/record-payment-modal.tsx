"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const paymentSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be greater than 0"),
    paymentDate: z.string().min(1, "Date is required"),
    paymentMethod: z.string().min(1, "Payment method is required"),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

interface RecordPaymentModalProps {
    loanId: string;
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

export function RecordPaymentModal({ loanId, onSuccess, trigger }: RecordPaymentModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<PaymentForm>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: "bank_transfer"
        }
    });

    const onSubmit = async (data: PaymentForm) => {
        setIsLoading(true);
        try {
            // In a real implementation:
            // await api.post(`/loan-partner-api/loans/${loanId}/payments`, data);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Recording payment for loan", loanId, data);

            toast({
                title: "Payment Recorded",
                description: `Successfully recorded payment of ₦${data.amount}`,
            });

            setOpen(false);
            reset();
            onSuccess?.();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to record payment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Record Payment</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Repayment</DialogTitle>
                    <DialogDescription>
                        Manually record a payment received for this loan.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount (₦)</Label>
                            <Input
                                id="amount"
                                placeholder="0.00"
                                {...register("amount")}
                            />
                            {errors.amount && (
                                <p className="text-sm text-red-500">{errors.amount.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="paymentDate">Payment Date</Label>
                            <Input
                                id="paymentDate"
                                type="date"
                                {...register("paymentDate")}
                            />
                            {errors.paymentDate && (
                                <p className="text-sm text-red-500">{errors.paymentDate.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select
                                onValueChange={(value: string) => setValue("paymentMethod", value)}
                                defaultValue="bank_transfer"
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.paymentMethod && (
                                <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reference">Reference / ID (Optional)</Label>
                            <Input
                                id="reference"
                                placeholder="e.g. TRX-123456"
                                {...register("reference")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Additional details..."
                                {...register("notes")}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Recording...
                                </>
                            ) : (
                                "Save Payment"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
