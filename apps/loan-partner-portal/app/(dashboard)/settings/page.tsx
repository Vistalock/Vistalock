"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Eye, EyeOff, Webhook, Save, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [showSecret, setShowSecret] = useState(false);

    // In a real app, we would fetch these from the API
    // For now, using the user context or placeholders
    // The current auth context stores the partner object which might not have the secret
    // We might need an endpoint to fetch 'my-settings'

    const [webhookUrl, setWebhookUrl] = useState("https://your-domain.com/webhook");
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard",
            description: `${label} has been copied to your clipboard.`,
        });
    };

    const handleSaveWebhook = async () => {
        setIsSaving(true);
        try {
            // await api.post('/loan-partner-api/branding', { webhookUrl });
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast({
                title: "Settings Saved",
                description: "Your webhook URL has been updated successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestWebhook = async () => {
        setIsTesting(true);
        try {
            // await api.post('/loan-partner-api/webhook/test');
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast({
                title: "Test Successful",
                description: "We successfully sent a test event to your webhook URL.",
            });
        } catch (error) {
            toast({
                title: "Test Failed",
                description: "Could not reach your webhook URL. Please check if it's publicly accessible.",
                variant: "destructive",
            });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">Manage your API credentials and integration settings</p>
            </div>

            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Partner Profile</CardTitle>
                    <CardDescription>Your business information on VistaLock</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Partner Name</Label>
                            <Input value={user?.name || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Merchant Association</Label>
                            <Input value={user?.merchantName || ''} disabled />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API Credentials */}
            <Card>
                <CardHeader>
                    <CardTitle>API Credentials</CardTitle>
                    <CardDescription>
                        Use these keys to authenticate your API requests. Keep your API Secret confidential.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>API Key</Label>
                        <div className="flex gap-2">
                            <Input value="lp_live_xxxxxxxxxxxxxxxxxxxxxxxx" disabled className="font-mono bg-gray-50" />
                            <Button variant="outline" size="icon" onClick={() => handleCopy("lp_live_...", "API Key")}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>API Secret</Label>
                        <div className="flex gap-2">
                            type={showSecret ? "text" : "password"}
                            value="********************************"
                            disabled
                            className="font-mono bg-gray-50"
                            />
                            <Button variant="outline" size="icon" onClick={() => setShowSecret(!showSecret)}>
                                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleCopy("sk_live_...", "API Secret")}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-yellow-600 flex items-center gap-1 mt-2">
                            <AlertTriangleIcon className="h-3 w-3" />
                            For security reasons, your full API Secret is only shown once upon generation.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Webhook Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        Webhook Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure where we should send real-time events like repayment updates.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhook">Webhook URL</Label>
                        <div className="flex gap-2">
                            <Input
                                id="webhook"
                                placeholder="https://..."
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                    <Button variant="outline" onClick={handleTestWebhook} disabled={isTesting}>
                        {isTesting ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Testing...
                            </>
                        ) : (
                            "Test Connection"
                        )}
                    </Button>
                    <Button onClick={handleSaveWebhook} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

function AlertTriangleIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    )
}
