"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Save, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function RiskControlsPage() {
    const [minScore, setMinScore] = useState([650]);
    const [autoApprove, setAutoApprove] = useState(false);
    const [interestRate, setInterestRate] = useState([5]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Risk & Controls</h1>
                    <p className="text-sm text-gray-500">Configure lending parameters and automated decision rules</p>
                </div>
                <Button>
                    <Save className="mr-2 h-4 w-4" />
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
                                <Input type="number" defaultValue="10000" />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Ticket Size</Label>
                                <Input type="number" defaultValue="500000" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Max Tenor (Months)</Label>
                            <div className="flex gap-2">
                                {[3, 6, 9, 12].map((m) => (
                                    <Button key={m} variant={m === 6 ? "default" : "outline"} size="sm" className="flex-1">
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
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Require Manual Review</Label>
                                <p className="text-xs text-muted-foreground">
                                    Flag loans &gt; ₦300,000 for Risk Officer review
                                </p>
                            </div>
                            <Switch defaultChecked />
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
