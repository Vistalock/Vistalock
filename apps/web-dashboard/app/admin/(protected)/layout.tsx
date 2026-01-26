'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UnifiedDashboardLayout from '@/components/layouts/UnifiedDashboardLayout';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Basic Client-side RBAC (Server-side check should be added to API calls)
        // Ideally, we would decode the JWT here to check the role
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/admin/login');
                return;
            }

            // Fetch profile to verify role
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const user = await res.json();

                    const adminRoles = [
                        'ADMIN', 'SUPER_ADMIN', 'OPS_ADMIN',
                        'RISK_ADMIN', 'COMPLIANCE_ADMIN',
                        'TECH_ADMIN', 'SUPPORT_ADMIN'
                    ];

                    if (!adminRoles.includes(user.role)) {
                        router.push('/dashboard'); // Kick back to merchant dashboard
                    } else {
                        setAuthorized(true);
                    }
                } else {
                    router.push('/admin/login');
                }
            } catch (e) {
                router.push('/admin/login');
            }
        };

        checkAuth();
    }, [router]);

    if (!authorized) return <div className="flex items-center justify-center h-screen">Checking permissions...</div>;

    return (
        <UnifiedDashboardLayout role="ADMIN" userEmail="superadmin@vistalock.com">
            {children}
        </UnifiedDashboardLayout>
    );
}
