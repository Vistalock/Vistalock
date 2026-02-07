/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import OpsDashboard from '@/components/admin/dashboards/OpsDashboard';
import RiskDashboard from '@/components/admin/dashboards/RiskDashboard';
import ComplianceDashboard from '@/components/admin/dashboards/ComplianceDashboard';
import FinanceDashboard from '@/components/admin/dashboards/FinanceDashboard';
import SuperAdminDashboard from '@/components/admin/dashboards/SuperAdminDashboard';

export default function AdminPage() {
    const [stats, setStats] = useState({
        totalMerchants: 0,
        totalDevices: 0,
        lockedDevices: 0,
        activeLoans: 0,
        totalRevenue: 0
    });
    const [recentMerchants, setRecentMerchants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // 1. Fetch User Profile to determine Role
                const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserRole(profileRes.data.role);

                // 2. Fetch Dashboard Data
                const [statsRes, merchantsRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin/merchants`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                setStats(statsRes.data);
                // Sort by joinedAt desc if not already sorted by backend
                const sorted = Array.isArray(merchantsRes.data)
                    ? merchantsRes.data.sort((a: any, b: any) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
                    : [];
                setRecentMerchants(sorted.slice(0, 5));
            } catch (e) {
                console.error("Failed to fetch dashboard data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Role-Based Rendering
    if (userRole === 'OPS_ADMIN') return <OpsDashboard stats={stats} />;
    if (userRole === 'RISK_ADMIN') return <RiskDashboard stats={stats} />;
    if (userRole === 'COMPLIANCE_ADMIN') return <ComplianceDashboard stats={stats} />;
    if (userRole === 'FINANCE_ADMIN') return <FinanceDashboard stats={stats} />;

    // Default to Super Admin / General Admin view
    return <SuperAdminDashboard stats={stats} recentMerchants={recentMerchants} />;
}
