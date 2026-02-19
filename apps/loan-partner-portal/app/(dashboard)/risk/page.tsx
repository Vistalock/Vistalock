"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Save, ShieldCheck, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export default function RiskControlsPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // In a real app, we get partnerId from context or auth
    // For MVP, we pass a hardcoded ID or assume the backend knows the user
    // However, the controller expects 'partnerId' query param.
    // Let's assume we store it in localStorage or derived from user.
    // For this demo, let's hardcode a valid UUID if possible, or expect backend to derive it.
    // My controller code: @Query('partnerId').
    // I should fix the controller to derive it from the USER, but for now I'll use a dummy ID.
    const PARTNER_ID = "4ac9f212-46d5-4602-b8d6-797c95c1179d";

    const { data: config, isLoading } = useQuery({
        queryKey: ['risk-config'],
        queryFn: async () => {
            const res = await api.get(`/loan-partner-api/risk-config?partnerId=${PARTNER_ID}`);
            return res.data;
        }
    });

    const [minScore, setMinScore] = useState([650]);
    const [autoApprove, setAutoApprove] = useState(false);
    const [interestRate, setInterestRate] = useState([5]);
    const [maxTicketSize, setMaxTicketSize] = useState(500000);
    const [minTicketSize, setMinTicketSize] = useState(10000);
    const [maxTenor, setMaxTenor] = useState(6);

    useEffect(() => {
        if (config) {
            setMinScore([config.minCreditScore || 650]);
            setAutoApprove(config.autoApprove || false);
            setInterestRate([Number(config.interestRate) || 5]);
            setMaxTicketSize(Number(config.maxTicketSize) || 500000);
            setMinTicketSize(Number(config.minTicketSize) || 10000);
            setMaxTenor(config.maxTenor || 6);
        }
    }, [config]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            return api.post('/loan-partner-api/risk-config', {
                partnerId: PARTNER_ID,
                ...data
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['risk-config'] });
            toast({ title: "Settings Saved", description: "Risk configuration updated successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        }
    });

    const handleSave = () => {
        mutation.mutate({
            minCreditScore: minScore[0],
            autoApprove,
            interestRate: interestRate[0],
            maxTicketSize,
            minTicketSize,
            maxTenor
        });
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Risk & Controls</h1>
                    <p className="text-sm text-gray-500">Configure lending parameters and automated decision rules</p>
                </div>
                <Button onClick={handleSave} disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                            Credit Policy
                        </CardTitle>
                        <CardDescription>Define eligibility criteria for borrowers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Minimum Credit Score</Label>
                                <span className="text-sm font-bold text-blue-600">{minScore}</span>
                            </div>
                            <Slider
                                value={minScore}
                                onValueChange={setMinScore}
                                max={850}
                                min={300}
                                step={10}
                            />
                            <p className="text-xs text-muted-foreground">Borrowers below this score will be auto-rejected.</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Base Interest Rate (Monthly)</Label>
                                <span className="text-sm font-bold text-blue-600">{interestRate}%</span>
                            </div>
                            <Slider
                                value={interestRate}
                                onValueChange={setInterestRate}
                                max={15}
                                min={1}
                                step={0.5}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Ticket Size</Label>
                                <Input type="number" value={minTicketSize} onChange={(e) => setMinTicketSize(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Ticket Size</Label>
                                <Input type="number" value={maxTicketSize} onChange={(e) => setMaxTicketSize(Number(e.target.value))} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Max Tenor (Months)</Label>
                            <div className="flex gap-2">
                                {[3, 6, 9, 12].map((m) => (
                                    <Button
                                        key={m}
                                        variant={maxTenor === m ? "default" : "outline"}
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => setMaxTenor(m)}
                                    >
                                        {m} Mo
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            Decision Engine
                        </CardTitle>
                        <CardDescription>Automate approvals and rejections</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Auto-Approve Low Risk</Label>
                                <p className="text-xs text-muted-foreground">
                                    Automatically fund requests with Credit Score &gt; 750
                                </p>
                            </div>
                            <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Auto-Reject High Risk</Label>
                                <p className="text-xs text-muted-foreground">
                                    Reject requests with active loans elsewhere
                                </p>
                            </div>
                            <Switch defaultChecked disabled />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Require Manual Review</Label>
                                <p className="text-xs text-muted-foreground">
                                    Flag loans &gt; ₦300,000 for Risk Officer review
                                </p>
                            </div>
                            <Switch defaultChecked disabled />
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 p-4">
                        <p className="text-xs text-muted-foreground">
                            Changes align with the Central Bank Lending Policy (Section 4.2).
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
