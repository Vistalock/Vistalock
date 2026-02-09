'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { loanPartnerService } from '@/lib/services/loanPartnerService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, TestTube, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestWebhookPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    const [webhookUrl, setWebhookUrl] = useState('');
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    const { data: partner, isLoading } = useQuery({
        queryKey: ['loanPartner', id],
        queryFn: () => loanPartnerService.getById(id),
    });

    // Test webhook mutation
    const testMutation = useMutation({
        mutationFn: (url: string) => loanPartnerService.testWebhook(id, url),
        onSuccess: (data) => {
            setTestResult(data);
            toast({
                title: data.success ? 'Success' : 'Failed',
                description: data.message,
                variant: data.success ? 'default' : 'destructive',
            });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to test webhook';
            setTestResult({ success: false, message: errorMessage });
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        },
    });

    const handleTest = () => {
        if (!webhookUrl) {
            toast({
                title: 'Error',
                description: 'Please enter a webhook URL',
                variant: 'destructive',
            });
            return;
        }
        setTestResult(null);
        testMutation.mutate(webhookUrl);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Loan partner not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/loan-partners">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Test Webhook</h1>
                    <p className="text-muted-foreground mt-1">{partner.name}</p>
                </div>
            </div>

            {/* Test Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Webhook Testing</CardTitle>
                    <CardDescription>
                        Send a test webhook to verify your endpoint is configured correctly
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhookUrl">Webhook URL</Label>
                        <Input
                            id="webhookUrl"
                            type="url"
                            placeholder="https://partner.com/webhooks/vistalock"
                            value={webhookUrl || partner.webhookUrl || ''}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            The URL where we'll send the test webhook payload
                        </p>
                    </div>

                    <Button
                        onClick={handleTest}
                        disabled={testMutation.isPending}
                    >
                        {testMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <TestTube className="h-4 w-4 mr-2" />
                        )}
                        Send Test Webhook
                    </Button>

                    {/* Test Result */}
                    {testResult && (
                        <Alert className={testResult.success ? 'bg-success/10 border-success' : 'bg-destructive/10 border-destructive'}>
                            {testResult.success ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <AlertDescription>
                                <strong>{testResult.success ? 'Success!' : 'Failed'}</strong>
                                <br />
                                {testResult.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Webhook Payload Example */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Payload</CardTitle>
                    <CardDescription>
                        Example payload that will be sent to your webhook
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                        {`{
  "event": "test",
  "timestamp": "${new Date().toISOString()}",
  "partnerId": "${partner.id}",
  "partnerName": "${partner.name}",
  "data": {
    "message": "This is a test webhook from VistaLock"
  }
}`}
                    </pre>
                </CardContent>
            </Card>

            {/* Webhook Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Webhook Events</CardTitle>
                    <CardDescription>
                        Events that will trigger webhooks to your endpoint
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-medium text-sm">loan.created</h4>
                            <p className="text-xs text-muted-foreground">Triggered when a new loan is created</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm">loan.payment_received</h4>
                            <p className="text-xs text-muted-foreground">Triggered when a payment is recorded</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm">loan.overdue</h4>
                            <p className="text-xs text-muted-foreground">Triggered when a loan becomes overdue</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm">loan.closed</h4>
                            <p className="text-xs text-muted-foreground">Triggered when a loan is fully paid</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm">device.locked</h4>
                            <p className="text-xs text-muted-foreground">Triggered when a device is locked</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm">device.unlocked</h4>
                            <p className="text-xs text-muted-foreground">Triggered when a device is unlocked</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
