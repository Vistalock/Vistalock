/* eslint-disable */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Sending login request for:', email);
            const res = await api.post('/auth/login', { email, password });
            console.log('Login response:', res.data);

            const adminRoles = [
                'ADMIN', 'SUPER_ADMIN', 'OPS_ADMIN',
                'RISK_ADMIN', 'COMPLIANCE_ADMIN',
                'TECH_ADMIN', 'SUPPORT_ADMIN'
            ];

            if (!adminRoles.includes(res.data.role)) {
                console.warn('Role mismatch:', res.data.role);
                setError('Unauthorized access. This portal is for Vistalock Staff only.');
                return;
            }

            // Store token
            localStorage.setItem('token', res.data.access_token);
            console.log('Token stored, redirecting...');
            router.push('/admin');
        } catch (err: any) {
            console.error('Login error full:', err);
            setError(err.response?.data?.message || 'Access Denied.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="mb-8 flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Lock className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">Vistalock Internal</span>
            </div>

            <Card className="w-full max-w-sm border-border bg-card text-card-foreground shadow-sm">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Staff Access</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Restricted System. All activities are logged.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                    <CardContent className="grid gap-4">
                        {error && <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center">{error}</div>}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Internal Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@vistalock.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-background border-input focus:ring-primary"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-background border-input focus:ring-primary pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" type="submit" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Secure Login'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <div className="mt-8 text-xs text-muted-foreground font-mono">
                System ID: VL-INT-PROD-01
            </div>
        </div>
    );
}
