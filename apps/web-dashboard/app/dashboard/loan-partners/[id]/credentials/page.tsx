'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tantml:invoke name="write_to_file">
<parameter name="CodeContent">'use client';

    import {useState, useEffect} from 'react';
    import {useParams, useSearchParams, useRouter} from 'next/navigation';
    import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
    import {loanPartnerService} from '@/lib/services/loanPartnerService';
    import {Button} from '@/components/ui/button';
    import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
    import {Input} from '@/components/ui/input';
    import {Label} from '@/components/ui/label';
    import {useToast} from '@/hooks/use-toast';
    import {ArrowLeft, Copy, Check, Key, AlertTriangle, Loader2} from 'lucide-react';
    import Link from 'next/link';
    import {
        AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogFooter,
        AlertDialogHeader,
        AlertDialogTitle,
} from '@/components/ui/alert-dialog';
    import {Alert, AlertDescription} from '@/components/ui/alert';

    export default function CredentialsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params.id as string;
    const isNew = searchParams.get('new') === 'true';
    const {toast} = useToast();
    const queryClient = useQueryClient();

    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [showRotateDialog, setShowRotateDialog] = useState(false);
    const [newCredentials, setNewCredentials] = useState<{ apiKey: string; apiSecret: string } | null>(null);

    const {data: partner, isLoading } = useQuery({
        queryKey: ['loanPartner', id],
        queryFn: () => loanPartnerService.getById(id),
    });

    // Rotate credentials mutation
    const rotateMutation = useMutation({
        mutationFn: () => loanPartnerService.rotateCredentials(id),
        onSuccess: (data) => {
        setNewCredentials(data);
    queryClient.invalidateQueries({queryKey: ['loanPartner', id] });
    toast({
        title: 'Success',
    description: 'API credentials rotated successfully',
            });
    setShowRotateDialog(false);
        },
        onError: (error: any) => {
        toast({
            title: 'Error',
            description: error.response?.data?.message || 'Failed to rotate credentials',
            variant: 'destructive',
        });
        },
    });

    const copyToClipboard = (text: string, type: 'key' | 'secret') => {
        navigator.clipboard.writeText(text);
    if (type === 'key') {
        setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        } else {
        setCopiedSecret(true);
            setTimeout(() => setCopiedSecret(false), 2000);
        }
    toast({
        title: 'Copied',
    description: `API ${type} copied to clipboard`,
        });
    };

    if (isLoading) {
        return (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading credentials...</p>
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
                <h1 className="text-3xl font-bold tracking-tight">API Credentials</h1>
                <p className="text-muted-foreground mt-1">{partner.name}</p>
            </div>
        </div>

        {/* New Partner Alert */}
        {isNew && !newCredentials && (
            <Alert className="bg-success/10 border-success">
                <Check className="h-4 w-4 text-success" />
                <AlertDescription>
                    <strong>Loan partner created successfully!</strong> Save the API secret below - it won't be shown again.
                </AlertDescription>
            </Alert>
        )}

        {/* New Credentials Alert */}
        {newCredentials && (
            <Alert className="bg-warning/10 border-warning">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription>
                    <strong>New credentials generated!</strong> Save the API secret below - it won't be shown again. Old credentials are now invalid.
                </AlertDescription>
            </Alert>
        )}

        {/* API Credentials */}
        <Card>
            <CardHeader>
                <CardTitle>API Credentials</CardTitle>
                <CardDescription>
                    Use these credentials to authenticate API requests from your loan partner system
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* API Key */}
                <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex gap-2">
                        <Input
                            value={newCredentials?.apiKey || partner.apiKey}
                            readOnly
                            className="font-mono text-sm"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(newCredentials?.apiKey || partner.apiKey, 'key')}
                        >
                            {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Include this in the Authorization header of API requests
                    </p>
                </div>

                {/* API Secret */}
                <div className="space-y-2">
                    <Label>API Secret</Label>
                    {newCredentials?.apiSecret || (isNew && partner.apiSecret) ? (
                        <>
                            <div className="flex gap-2">
                                <Input
                                    value={newCredentials?.apiSecret || partner.apiSecret || ''}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(newCredentials?.apiSecret || partner.apiSecret || '', 'secret')}
                                >
                                    {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <Alert className="bg-destructive/10 border-destructive">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                <AlertDescription className="text-sm">
                                    <strong>Important:</strong> This is the only time you'll see this secret. Save it securely now.
                                </AlertDescription>
                            </Alert>
                        </>
                    ) : (
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                API secret is hidden for security. Rotate credentials to generate a new secret.
                            </p>
                        </div>
                    )}
                </div>

                {/* Rotate Button */}
                <div className="pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => setShowRotateDialog(true)}
                        disabled={rotateMutation.isPending}
                    >
                        {rotateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Key className="h-4 w-4 mr-2" />
                        )}
                        Rotate Credentials
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                        Generate new API credentials. Old credentials will be immediately invalidated.
                    </p>
                </div>
            </CardContent>
        </Card>

        {/* Integration Guide */}
        <Card>
            <CardHeader>
                <CardTitle>Integration Guide</CardTitle>
                <CardDescription>
                    How to use these credentials in your application
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-medium mb-2">Authentication</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                        Send a POST request to <code className="bg-muted px-2 py-1 rounded text-xs">/loan-partner-api/auth/login</code> with:
                    </p>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                        {`{
  "apiKey": "${newCredentials?.apiKey || partner.apiKey}",
  "apiSecret": "YOUR_API_SECRET"
}`}
                    </pre>
                </div>

                <div>
                    <h4 className="font-medium mb-2">Using the Access Token</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                        Include the returned JWT token in subsequent requests:
                    </p>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                        {`Authorization: Bearer YOUR_JWT_TOKEN`}
                    </pre>
                </div>

                <div>
                    <h4 className="font-medium mb-2">API Endpoints</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <code className="bg-muted px-2 py-1 rounded text-xs">POST /loan-partner-api/loans</code> - Create a loan</li>
                        <li>• <code className="bg-muted px-2 py-1 rounded text-xs">POST /loan-partner-api/repayments</code> - Record payment</li>
                        <li>• <code className="bg-muted px-2 py-1 rounded text-xs">GET /loan-partner-api/devices</code> - Get devices</li>
                        <li>• <code className="bg-muted px-2 py-1 rounded text-xs">GET /loan-partner-api/loans</code> - Get loans</li>
                    </ul>
                </div>
            </CardContent>
        </Card>

        {/* Rotate Confirmation Dialog */}
        <AlertDialog open={showRotateDialog} onOpenChange={setShowRotateDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Rotate API Credentials?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will generate new API credentials and immediately invalidate the old ones.
                        Make sure you're ready to update your integration with the new credentials.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => rotateMutation.mutate()}
                        className="bg-warning text-warning-foreground hover:bg-warning/90"
                    >
                        Rotate Credentials
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
    );
}
