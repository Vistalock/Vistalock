'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

function ActivateAgentForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const type = searchParams.get('type') || 'agent'; // 'agent' or 'merchant'

    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState('');
    const [agentName, setAgentName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isActivated, setIsActivated] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Missing activation token');
            setVerifying(false);
            setLoading(false);
            return;
        }

        // For merchant activation, skip token verification (will be done on activation)
        if (type === 'merchant') {
            setVerifying(false);
            setLoading(false);
        } else {
            verifyToken(token);
        }
    }, [token, type]);

    const verifyToken = async (token: string) => {
        try {
            const response = await api.post('/agents/validate-token', { token });
            // For now, assume it's valid if no error.
            setAgentName('Agent'); // Default
            setVerifying(false);
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Invalid or expired activation token');
            setVerifying(false);
            setLoading(false);
        }
    };

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 12) {
            setError('Password must be at least 12 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            if (type === 'merchant') {
                // Merchant activation
                await api.post('/auth/merchant/activate', {
                    token,
                    password
                });
            } else {
                // Agent activation (no deviceId needed - will be bound on first mobile login)
                await api.post('/agents/activate', {
                    token,
                    password
                });
            }

            setIsActivated(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to activate account');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying activation token...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Activation Failed</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <p className="text-sm text-gray-400">Please request a new activation link from your merchant.</p>
                </div>
            </div>
        );
    }

    if (isActivated) {
        if (type === 'merchant') {
            // Merchant success - redirect to login
            setTimeout(() => router.push('/login'), 2000);
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Activated!</h2>
                        <p className="text-gray-600 mb-6">
                            Your merchant account has been successfully activated.
                        </p>
                        <p className="text-sm text-gray-500">Redirecting to login page...</p>
                    </div>
                </div>
            );
        }

        // Agent success
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Activated!</h2>
                    <p className="text-gray-600 mb-6">
                        Your agent account is now active. You can now download the database and start onboarding customers.
                    </p>

                    <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                        <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
                        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                            <li>Download the <strong>VistaLock Agent App</strong>.</li>
                            <li>Log in with your phone number and the password you just set.</li>
                        </ul>
                    </div>

                    <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                        Download App (Coming Soon)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Activate Account</h1>
                    <p className="text-gray-500 mt-2">Set up your password to continue</p>
                </div>

                <form onSubmit={handleActivate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-10"
                                placeholder="Min. 12 characters"
                                minLength={12}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-10"
                                placeholder="Repeat password"
                                minLength={12}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Activating...' : 'Set Password & Activate'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ActivatePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ActivateAgentForm />
        </Suspense>
    );
}
