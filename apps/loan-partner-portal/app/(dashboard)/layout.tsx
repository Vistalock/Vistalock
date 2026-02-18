"use client";

import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import UnifiedDashboardLayout from "@/components/layouts/UnifiedDashboardLayout";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, isAuthenticated } = useAuth();

    // Protect the route
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            window.location.href = "/login";
        }
    }, [loading, isAuthenticated]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return (
        <UnifiedDashboardLayout userEmail={user?.contactEmail}>
            {children}
        </UnifiedDashboardLayout>
    );
}
