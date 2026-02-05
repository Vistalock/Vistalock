/* eslint-disable */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, CheckCircle2 } from "lucide-react";

export default function BillingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Billing & Subscription</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your platform subscription plan.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>You are currently on the Enterprise plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between border p-4 rounded-lg bg-primary/5 border-primary/20">
                        <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-lg">Vistalock Enterprise</p>
                                <p className="text-sm text-muted-foreground">Unlimited devices • Priority Support</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-transparent bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            Active
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Plan Features</h4>
                        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> Unlimited Merchants</li>
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> Advanced Analytics</li>
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> White-label Options</li>
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> API Access</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
