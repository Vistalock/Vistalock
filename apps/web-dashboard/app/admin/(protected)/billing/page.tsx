"use client";

import BillingOverview from "@/components/admin/billing/BillingOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MerchantBillingList from "@/components/admin/billing/MerchantBillingList";
import PricingTiersList from "@/components/admin/billing/PricingTiersList";

export default function AdminBillingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Finance</h1>
                <p className="text-muted-foreground">Manage platform revenue, merchant wallets, and payouts.</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="merchants">Merchant Wallets</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing Tiers</TabsTrigger>
                    <TabsTrigger value="refunds">Refunds</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <BillingOverview />
                </TabsContent>
                <TabsContent value="merchants" className="space-y-4">
                    <MerchantBillingList />
                </TabsContent>
                <TabsContent value="pricing" className="space-y-4">
                    <PricingTiersList />
                </TabsContent>
                <TabsContent value="refunds">
                    <div className="flex h-[450px] items-center justify-center rounded-md border border-dashed">
                        <p className="text-muted-foreground">Refund processing UI coming soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
