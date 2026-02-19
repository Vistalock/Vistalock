'use client';

import { useState, useEffect } from 'react';
import { getIntegrations, rotateApiKey, updateWebhook } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Copy, RefreshCw, Eye, EyeOff, Save } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function IntegrationsPage() {
    const [config, setConfig] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [newSecret, setNewSecret] = useState<string | null>(null);

    const { toast } = useToast();

    const fetchConfig = async () => {
        setIsLoading(true);
        try {
            const data = await getIntegrations();
            setConfig(data);
            setWebhookUrl(data.webhookUrl || '');
            setWebhookSecret(data.webhookSecret || '');
        } catch (error) {
            console.error('Failed to fetch integrations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "Copied to clipboard." });
    };

    const handleSaveWebhook = async () => {
        setIsSaving(true);
        try {
            await updateWebhook(webhookUrl, webhookSecret);
            toast({ title: "Success", description: "Webhook settings saved." });
        } catch (error) {
            console.error('Failed to save webhook:', error);
            toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRotateKey = async () => {
        setIsRotating(true);
        try {
            const result = await rotateApiKey();
            setConfig({ ...config, apiKey: result.apiKey });
            setNewSecret(result.apiSecret);
            toast({
                title: "Keys Rotated",
                description: "Your new API Secret is shown below. Copy it now!",
            });
        } catch (error) {
            console.error('Failed to rotate key:', error);
            toast({ title: "Error", description: "Failed to rotate keys.", variant: "destructive" });
        } finally {
            setIsRotating(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {newSecret && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="text-green-800 font-medium mb-2">New API Secret Generated</h4>
                    <p className="text-green-700 text-sm mb-3">This is the only time you will see this secret. Copy it immediately.</p>
                    <div className="flex items-center gap-2 bg-white p-2 rounded border border-green-200">
                        <code className="text-sm font-mono flex-1 break-all">{newSecret}</code>
                        <Button variant="ghost" size="icon" onClick={() => handleCopy(newSecret)} className="h-8 w-8 text-green-700">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 text-green-700 border-green-300 hover:bg-green-100" onClick={() => setNewSecret(null)}>
                        I have saved it
                    </Button>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>API Credentials</CardTitle>
                    <CardDescription>Manage your API keys for accessing Vistalock resources programmatically.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Public Key</Label>
                        <div className="flex gap-2">
                            <Input value={config?.apiKey || ''} readOnly className="font-mono bg-muted" />
                            <Button variant="outline" size="icon" onClick={() => handleCopy(config?.apiKey)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 bg-muted/50 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last rotated: Never</span>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={isRotating}>
                                {isRotating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                Roll Key
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Roll API Key?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will invalidate your current API Key and Secret immediately. Any running integrations using the old credentials will stop working.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleRotateKey} className="bg-destructive hover:bg-destructive/90">Yes, Roll Key</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>Configure where we should send real-time events.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Webhook URL</Label>
                        <Input
                            placeholder="https://your-api.com/webhooks/vistalock"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">We will send POST requests to this URL for events like <code>loan.approved</code> or <code>repayment.success</code>.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Webhook Secret (Optional)</Label>
                        <div className="relative">
                            <Input
                                type={showKey ? "text" : "password"}
                                placeholder="Secret for signature verification"
                                value={webhookSecret}
                                onChange={(e) => setWebhookSecret(e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 bg-muted/50 flex justify-end">
                    <Button onClick={handleSaveWebhook} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
