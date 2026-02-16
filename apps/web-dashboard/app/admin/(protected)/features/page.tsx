"use client";

import FeatureCatalogAdmin from "@/components/admin/features/FeatureCatalogAdmin";
import FeatureRequestsAdmin from "@/components/admin/features/FeatureRequestsAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminFeaturesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Feature Management</h1>
                <p className="text-muted-foreground">Manage service catalog and review merchant feature requests.</p>
            </div>

            <Tabs defaultValue="catalog" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="catalog">Service Catalog</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                </TabsList>
                <TabsContent value="catalog" className="space-y-4">
                    <FeatureCatalogAdmin />
                </TabsContent>
                <TabsContent value="requests" className="space-y-4">
                    <FeatureRequestsAdmin />
                </TabsContent>
            </Tabs>
        </div>
    );
}
