"use client";

import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CreditCard,
    Smartphone,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, loading, isAuthenticated } = useAuth();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const navigation = [
        { name: "Overview", href: "/", icon: LayoutDashboard },
        { name: "Loans", href: "/loans", icon: CreditCard },
        { name: "Devices", href: "/devices", icon: Smartphone },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center justify-between px-6 border-b">
                    <span className="text-lg font-bold text-gray-900">Loan Partner</span>
                    <button
                        className="lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-col justify-between h-[calc(100vh-64px)] p-4">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-700 hover:bg-gray-100"
                                    )}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t pt-4">
                        <div className="mb-4 px-3">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.merchantName}</p>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={logout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6 lg:px-8">
                    <button
                        className="text-gray-500 lg:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex flex-1 justify-end">
                        {/* Header actions if needed */}
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
