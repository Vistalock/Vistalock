/* eslint-disable */
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Copy, Eye, RefreshCw } from "lucide-react";
import { api } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";

export default function PartnerSettings() {
    const [loading, setLoading] = useState(true);
    const [apiKey, setApiKey] = useState("");
    const [webhookSecret, setWebhookSecret] = useState("");
    const [callbackUrl, setCallbackUrl] = useState("");
    const [showKey, setShowKey] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchCredentials();
    }, []);

    const fetchCredentials = async () => {
        try {
            const res = await api.get('/loan-partners/credentials');
            setApiKey(res.data.apiKey || 'No Key Generated');
            setWebhookSecret(res.data.webhookSecret || 'No Secret');
            setCallbackUrl(res.data.baseUrl || '');
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to load credentials", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleRotateKey = async () => {
        if (!confirm("Are you sure? This will invalidate the old key immediately.")) return;

        try {
            const res = await api.post('/loan-partners/credentials/rotate', {});
            setApiKey(res.data.apiKey);
            toast({ title: "Success", description: "New API Key generated" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to rotate key", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Integration Settings</h3>
                <p className="text-sm text-muted-foreground">Manage your API keys and webhook configurations.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>API Credentials</CardTitle>
                    <CardDescription>Use these keys to authenticate requests from your loan management system.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Environment</Label>
                        <div className="flex items-center space-x-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">LIVE</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>API Secret Key</Label>
                        <div className="flex space-x-2">
                            <Input
                                type={showKey ? "text" : "password"}
                                value={loading ? "Loading..." : apiKey}
                                readOnly
                                className="font-mono bg-muted"
                            />
                            <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => {
                                navigator.clipboard.writeText(apiKey);
                                toast({ title: "Copied", description: "API Key copied to clipboard" });
                            }}>
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" title="Roll Key" onClick={handleRotateKey}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Keep this key secret. Do not expose it in client-side code.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>Receive real-time updates about device status changes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Callback URL</Label>
                        <div className="flex space-x-2">
                            <Input
                                placeholder="https://api.yourmfi.com/webhooks/vistalock"
                                value={callbackUrl}
                                onChange={(e) => setCallbackUrl(e.target.value)}
                            />
                            <Button disabled>Save</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Contact support to update webhook URL.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Signing Secret</Label>
                        <div className="flex space-x-2">
                            <Input value={webhookSecret} readOnly className="font-mono bg-muted" />
                            <Button variant="outline" size="icon" onClick={() => {
                                navigator.clipboard.writeText(webhookSecret);
                                toast({ title: "Copied", description: "Secret copied to clipboard" });
                            }}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
