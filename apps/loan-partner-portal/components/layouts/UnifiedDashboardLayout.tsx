/* eslint-disable */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Smartphone, CreditCard, Settings, Shield, LogOut, PanelLeft, User, Menu } from 'lucide-react';
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

const PARTNER_NAV: NavItem[] = [
    { title: 'Overview', href: '/', icon: <LayoutDashboard className="h-4 w-4" /> },
    { title: 'Loans', href: '/loans', icon: <CreditCard className="h-4 w-4" /> },
    { title: 'Devices', href: '/devices', icon: <Smartphone className="h-4 w-4" /> },
    { title: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> },
];

interface UnifiedDashboardLayoutProps {
    children: React.ReactNode;
    userEmail?: string;
}

export default function UnifiedDashboardLayout({ children, userEmail }: UnifiedDashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const navItems = PARTNER_NAV;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('partner');
        router.push('/login');
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
                        {!isSidebarCollapsed && <span>VistaLock Partner</span>}
                    </div>
                </div>
                <nav className="flex flex-col gap-2 px-2 py-4 flex-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
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

                    {/* Mobile Menu Trigger */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="sm:hidden -ml-2 p-2">
                                <Menu className="h-6 w-6" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px] sm:hidden">
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <DropdownMenuItem>
                                        {item.icon}
                                        <span className="ml-2">{item.title}</span>
                                    </DropdownMenuItem>
                                </Link>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                                <LogOut className="h-4 w-4 mr-2" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>


                    <div className="ml-auto flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-background cursor-pointer hover:bg-primary/30 transition-colors">
                                    {userEmail?.[0]?.toUpperCase() || 'P'}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">Loan Partner</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {userEmail || 'partner@vistalock.com'}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
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
                    {/* Page Title & Breadcrumbs could go here */}
                    {children}
                </main>
            </div>
        </div>
    );
}
