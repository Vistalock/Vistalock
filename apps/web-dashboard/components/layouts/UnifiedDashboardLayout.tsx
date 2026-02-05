/* eslint-disable */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Smartphone, CreditCard, Users, FileText, Settings, Shield, LogOut, UserCog, TrendingUp, Menu, PanelLeft, CreditCard as BillingIcon, User, Keyboard } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';

type NavItem = {
    title: string;
    href: string;
    icon: React.ReactNode;
};

const MERCHANT_NAV: NavItem[] = [
    { title: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { title: 'Products', href: '/dashboard/products', icon: <Smartphone className="h-4 w-4" /> },
    { title: 'Customers', href: '/dashboard/customers', icon: <Users className="h-4 w-4" /> },
    { title: 'Devices', href: '/dashboard/devices', icon: <Smartphone className="h-4 w-4" /> },
    { title: 'Loans', href: '/dashboard/loans', icon: <CreditCard className="h-4 w-4" /> },
    { title: 'Agents', href: '/dashboard/agents', icon: <UserCog className="h-4 w-4" /> },
    { title: 'Reports', href: '/dashboard/reports', icon: <FileText className="h-4 w-4" /> },
    { title: 'Finance', href: '/dashboard/finance', icon: <BillingIcon className="h-4 w-4" /> },
    { title: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-4 w-4" /> },
];

const ADMIN_NAV: NavItem[] = [
    { title: 'Overview', href: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
    { title: 'Analytics', href: '/admin/analytics', icon: <TrendingUp className="h-4 w-4" /> },
    { title: 'Merchants', href: '/admin/merchants', icon: <Users className="h-4 w-4" /> },
    { title: 'Applications', href: '/admin/applications', icon: <FileText className="h-4 w-4" /> },
    { title: 'Team', href: '/admin/users', icon: <UserCog className="h-4 w-4" /> }, // New: Internal Team
    { title: 'Audit Logs', href: '/admin/audit', icon: <FileText className="h-4 w-4" /> },
    { title: 'System Config', href: '/admin/config', icon: <Settings className="h-4 w-4" /> },
];

const PARTNER_NAV: NavItem[] = [
    { title: 'Overview', href: '/partner/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { title: 'Loans', href: '/partner/loans', icon: <CreditCard className="h-4 w-4" /> },
    { title: 'Devices', href: '/partner/devices', icon: <Smartphone className="h-4 w-4" /> }, // Filtered for Partner
    { title: 'Integration', href: '/partner/settings', icon: <Settings className="h-4 w-4" /> },
];

interface UnifiedDashboardLayoutProps {
    children: React.ReactNode;
    role: 'ADMIN' | 'MERCHANT' | 'LOAN_PARTNER';
    userEmail?: string;
}

export default function UnifiedDashboardLayout({ children, role, userEmail }: UnifiedDashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    let navItems = MERCHANT_NAV;
    if (role === 'ADMIN') navItems = ADMIN_NAV;
    if (role === 'LOAN_PARTNER') navItems = PARTNER_NAV;

    const handleLogout = () => {
        localStorage.removeItem('token');
        if (role === 'ADMIN') router.push('/admin/login');
        else if (role === 'LOAN_PARTNER') router.push('/partner/login');
        else router.push('/login');
    };

    return (
        <div className="flex min-h-screen w-full bg-muted/40 transition-all duration-300">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-background transition-all duration-300 sm:flex",
                isSidebarCollapsed ? "w-[70px]" : "w-64"
            )}>
                <div className={cn("flex h-[64px] min-h-[64px] max-h-[64px] overflow-hidden items-center border-b border-gray-200 px-4 box-border", isSidebarCollapsed ? "justify-center" : "px-6")}>
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <Shield className="h-6 w-6 text-primary" />
                        {!isSidebarCollapsed && <span>VistaLock {role === 'ADMIN' ? 'Admin' : ''}</span>}
                    </div>
                </div>
                <nav className="flex flex-col gap-2 px-2 py-4 flex-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground",
                                    isSidebarCollapsed && "justify-center px-2"
                                )}
                                title={isSidebarCollapsed ? item.title : undefined}
                            >
                                {item.icon}
                                {!isSidebarCollapsed && item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Section */}
                <div className="border-t p-2">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-red-500 hover:bg-red-50",
                            isSidebarCollapsed && "justify-center"
                        )}
                        title={isSidebarCollapsed ? "Logout" : undefined}
                    >
                        <LogOut className="h-4 w-4" />
                        {!isSidebarCollapsed && "Logout"}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={cn("flex flex-col w-full transition-all duration-300", isSidebarCollapsed ? "sm:pl-[70px]" : "sm:pl-64")}>
                <header className="sticky top-0 z-30 flex h-[64px] min-h-[64px] max-h-[64px] overflow-hidden items-center gap-4 border-b border-gray-200 bg-background px-6 box-border">
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden sm:inline-flex">
                        <PanelLeft className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </button>

                    <div className="relative flex-1 md:grow-0">
                        <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <input
                            type="search"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    router.push(`/admin/search?q=${(e.target as HTMLInputElement).value}`);
                                }
                            }}
                            placeholder="Search..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px] h-9 border text-sm outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <Link href="/admin/notifications">
                            <button className="text-muted-foreground hover:text-foreground">
                                <span className="sr-only">Notifications</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            </button>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-background cursor-pointer hover:bg-primary/30 transition-colors">
                                    {userEmail?.[0].toUpperCase() || 'U'}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">Admin User</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {userEmail || 'admin@vistalock.com'}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <Link href="/admin/profile">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/admin/billing">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <BillingIcon className="mr-2 h-4 w-4" />
                                            <span>Billing</span>
                                            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/admin/config">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                    </Link>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 md:gap-8">
                    {/* Page Title & Actions Area */}
                    <div className="flex items-center justify-between space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">{navItems.find(i => i.href === pathname)?.title || 'Dashboard'}</h2>
                        <div className="flex items-center space-x-2">
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                <span>Nov 26, 2025 - Dec 23, 2025</span>
                            </button>
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                Download
                            </button>
                        </div>
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
}
