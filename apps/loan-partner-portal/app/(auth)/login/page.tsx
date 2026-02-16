"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useState } from "react";
import { Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
    apiKey: z.string().min(1, "API Key is required"),
    apiSecret: z.string().min(1, "API Secret is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            const response = await api.post("/loan-partner-api/auth/login", data);
            const { accessToken, partner } = response.data;

            login(accessToken, partner);

            toast({
                title: "Login Successful",
                description: `Welcome back, ${partner.name}`,
            });
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.response?.data?.message || "Invalid credentials",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Loan Partner Portal
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in to manage your lending portfolio
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>Enter your API credentials to continue</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="apiKey">API Key</Label>
                                <Input
                                    id="apiKey"
                                    placeholder="lp_live_..."
                                    {...register("apiKey")}
                                    disabled={isLoading}
                                />
                                {errors.apiKey && (
                                    <p className="text-sm text-red-500">{errors.apiKey.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apiSecret">API Secret</Label>
                                <Input
                                    id="apiSecret"
                                    type="password"
                                    placeholder="••••••••••••••••"
                                    {...register("apiSecret")}
                                    disabled={isLoading}
                                />
                                {errors.apiSecret && (
                                    <p className="text-sm text-red-500">{errors.apiSecret.message}</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
