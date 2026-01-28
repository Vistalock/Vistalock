'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Clock } from 'lucide-react';

export default function ApplicationSubmittedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="mb-8 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">V</div>
                <span className="text-xl font-bold tracking-tight">VistaLock</span>
            </div>

            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-green-100 p-3">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Application Submitted!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        Thank you for submitting your merchant application to VistaLock.
                    </p>

                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-primary mt-0.5" />
                            <div className="text-left">
                                <p className="font-medium text-sm">Check Your Email</p>
                                <p className="text-sm text-muted-foreground">
                                    We've sent a confirmation email to your registered address.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-primary mt-0.5" />
                            <div className="text-left">
                                <p className="font-medium text-sm">Review in Progress</p>
                                <p className="text-sm text-muted-foreground">
                                    Our team will review your application within <strong>48 hours</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Once approved, you'll receive an email with an activation link to set up your merchant dashboard.
                        </p>
                        <Link href="/">
                            <Button variant="outline" className="w-full">
                                Return to Homepage
                            </Button>
                        </Link>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Questions? Contact us at{' '}
                        <a href="mailto:support@vistalock.com" className="text-primary hover:underline">
                            support@vistalock.com
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
