import UnifiedDashboardLayout from '@/components/layouts/UnifiedDashboardLayout';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // In a real app, you'd fetch the user's email/profile here or in a context
    return (
        <UnifiedDashboardLayout role="MERCHANT" userEmail="merchant@vistalock.com">
            {children}
        </UnifiedDashboardLayout>
    );
}
