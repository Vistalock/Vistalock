import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock } from 'lucide-react';

export default function PendingApprovalPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="mb-8 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    V
                </div>
                <span className="text-xl font-bold tracking-tight">Vistalock</span>
            </div>

            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Application Submitted</CardTitle>
                    <CardDescription>
                        Thank you for registering your business with Vistalock.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted p-4 text-sm text-left">
                        <p className="mb-2 font-semibold">What happens next?</p>
                        <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                            <li>Our compliance team will review your documents.</li>
                            <li> Verification typically takes <strong>24-48 hours</strong>.</li>
                            <li>You will receive an email notification once approved.</li>
                        </ul>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        You cannot access the dashboard until your account is approved.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/login">
                        <Button variant="outline">Return to Login</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
