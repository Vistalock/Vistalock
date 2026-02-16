"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const loanSchema = z.object({
    deviceImei: z.string().min(10, "Valid IMEI required"),
    customerPhone: z.string().min(10, "Valid Phone Number required"),
    customerNin: z.string().min(11, "Valid NIN required"),
    productId: z.string().min(1, "Product selection is required"),
    loanAmount: z.string().min(1, "Amount is required").transform(v => parseFloat(v)),
    downPayment: z.string().default("0").transform(v => parseFloat(v)),
    tenure: z.string().default("6").transform(v => parseInt(v)),
    monthlyRepayment: z.string().default("0").transform(v => parseFloat(v)),
});

type LoanFormInput = z.input<typeof loanSchema>;
type LoanFormOutput = z.output<typeof loanSchema>;

export default function CreateLoanPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        // Fetch products available for this partner
        const fetchProducts = async () => {
            try {
                const res = await api.get('/loan-partner-api/products');
                setProducts(res.data);
            } catch (error) {
                console.error("Failed to fetch products", error);
                toast({
                    title: "Error",
                    description: "Failed to load products",
                    variant: "destructive"
                });
            }
        };
        fetchProducts();
    }, []);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<LoanFormInput, any, LoanFormOutput>({
        resolver: zodResolver(loanSchema),
        defaultValues: {
            tenure: "6",
        }
    });

    // Auto-calculate logic (simplified)
    const amount = watch("loanAmount");
    const tenure = watch("tenure");

    useEffect(() => {
        const amt = parseFloat(amount || "0");
        const ten = parseInt(tenure || "0");
        if (amt && ten) {
            const monthly = (amt * 1.05) / ten; // 5% interest flat
            setValue("monthlyRepayment", monthly.toFixed(2));
        }
    }, [amount, tenure, setValue]);

    const onSubmit = async (data: LoanFormOutput) => {
        setIsLoading(true);
        try {
            await api.post("/loan-partner-api/loans", {
                ...data,
                deviceImei: data.deviceImei.trim(),
                customerPhone: data.customerPhone.trim(),
                customerNin: data.customerNin.trim(),
            });

            toast({
                title: "Loan Created",
                description: "The loan has been successfully initialized.",
            });

            router.push("/dashboard/loans");
        } catch (error: any) {
            toast({
                title: "Creation Failed",
                description: error.response?.data?.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">New Loan Application</h1>
                    <p className="text-sm text-gray-500">Fund a new device loan for a customer</p>
                </div>
            </div>

            <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>Loan Details</CardTitle>
                        <CardDescription>Enter the device and financing details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="deviceImei">Device IMEI</Label>
                                <Input id="deviceImei" placeholder="3528..." {...register("deviceImei")} />
                                {errors.deviceImei && <p className="text-red-500 text-xs">{errors.deviceImei.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="productId">Product Model</Label>
                                <Select onValueChange={(v) => setValue("productId", v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name} - ₦{p.price}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input type="hidden" {...register("productId")} />
                                {errors.productId && <p className="text-red-500 text-xs">{errors.productId.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Customer Information</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input placeholder="Phone Number (080...)" {...register("customerPhone")} />
                                <Input placeholder="NIN (11 digits)" {...register("customerNin")} />
                            </div>
                            {errors.customerPhone && <p className="text-red-500 text-xs">{errors.customerPhone.message}</p>}
                            {errors.customerNin && <p className="text-red-500 text-xs">{errors.customerNin.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="loanAmount">Loan Amount (₦)</Label>
                                <Input id="loanAmount" type="number" {...register("loanAmount")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="downPayment">Down Payment (₦)</Label>
                                <Input id="downPayment" type="number" {...register("downPayment")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tenure">Tenure (Months)</Label>
                                <Input id="tenure" type="number" {...register("tenure")} />
                            </div>
                        </div>

                        <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                            <div className="flex justify-between items-center font-medium">
                                <span>Monthly Repayment:</span>
                                <span>₦{watch("monthlyRepayment") || 0}</span>
                            </div>
                            <Input type="hidden" {...register("monthlyRepayment")} />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Loan
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
