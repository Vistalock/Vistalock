// Vistalock Design System - Color Usage Examples
// This file demonstrates how to use the design system colors in your components

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * DEVICE STATUS BADGES
 * Use semantic colors to indicate device status
 */
export function DeviceStatusBadge({ status }: { status: string }) {
    const statusConfig = {
        ACTIVE: {
            className: 'bg-success text-success-foreground',
            label: 'Active'
        },
        LOCKED: {
            className: 'bg-destructive text-destructive-foreground',
            label: 'Locked'
        },
        PENDING: {
            className: 'bg-warning text-warning-foreground',
            label: 'Pending Setup'
        },
        INACTIVE: {
            className: 'bg-muted text-muted-foreground',
            label: 'Inactive'
        }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;

    return <Badge className={config.className}>{config.label}</Badge>;
}

/**
 * LOAN STATUS BADGES
 * Use semantic colors for loan payment status
 */
export function LoanStatusBadge({ status }: { status: string }) {
    const statusConfig = {
        ACTIVE: {
            className: 'bg-success text-success-foreground',
            label: 'Active'
        },
        OVERDUE: {
            className: 'bg-destructive text-destructive-foreground',
            label: 'Overdue'
        },
        PENDING_APPROVAL: {
            className: 'bg-warning text-warning-foreground',
            label: 'Pending Approval'
        },
        COMPLETED: {
            className: 'bg-info text-info-foreground',
            label: 'Completed'
        },
        DEFAULTED: {
            className: 'bg-destructive text-destructive-foreground',
            label: 'Defaulted'
        }
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    return <Badge className={config.className}>{config.label}</Badge>;
}

/**
 * PAYMENT STATUS BADGES
 * Use semantic colors for payment transaction status
 */
export function PaymentStatusBadge({ status }: { status: string }) {
    const statusConfig = {
        SUCCESS: {
            className: 'bg-success text-success-foreground',
            label: 'Payment Received'
        },
        FAILED: {
            className: 'bg-destructive text-destructive-foreground',
            label: 'Payment Failed'
        },
        PENDING: {
            className: 'bg-warning text-warning-foreground',
            label: 'Processing'
        },
        REFUNDED: {
            className: 'bg-info text-info-foreground',
            label: 'Refunded'
        }
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    return <Badge className={config.className}>{config.label}</Badge>;
}

/**
 * APPLICATION STATUS BADGES
 * Use semantic colors for merchant application workflow
 */
export function ApplicationStatusBadge({ status }: { status: string }) {
    const statusConfig = {
        PENDING_OPS_REVIEW: {
            className: 'bg-warning text-warning-foreground',
            label: 'Ops Review'
        },
        PENDING_RISK_REVIEW: {
            className: 'bg-warning text-warning-foreground',
            label: 'Risk Review'
        },
        APPROVED: {
            className: 'bg-success text-success-foreground',
            label: 'Approved'
        },
        REJECTED: {
            className: 'bg-destructive text-destructive-foreground',
            label: 'Rejected'
        }
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    return <Badge className={config.className}>{config.label}</Badge>;
}

/**
 * ACTION BUTTONS
 * Use appropriate button variants for different actions
 */
export function ActionButtons() {
    return (
        <div className="flex gap-2">
            {/* Primary action - most important */}
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Create Loan
            </Button>

            {/* Secondary action - alternative */}
            <Button variant="secondary">
                Cancel
            </Button>

            {/* Destructive action - dangerous */}
            <Button variant="destructive">
                Delete Device
            </Button>

            {/* Success action - positive outcome */}
            <Button className="bg-success text-success-foreground hover:bg-success/90">
                Approve Application
            </Button>

            {/* Outline - less emphasis */}
            <Button variant="outline">
                View Details
            </Button>
        </div>
    );
}

/**
 * STATS CARDS
 * Use semantic colors for different metric types
 */
export function StatsCard({
    title,
    value,
    type
}: {
    title: string;
    value: string | number;
    type: 'success' | 'warning' | 'error' | 'info' | 'neutral'
}) {
    const typeConfig = {
        success: {
            iconBg: 'bg-success/10',
            iconColor: 'text-success',
            borderColor: 'border-success/20'
        },
        warning: {
            iconBg: 'bg-warning/10',
            iconColor: 'text-warning',
            borderColor: 'border-warning/20'
        },
        error: {
            iconBg: 'bg-destructive/10',
            iconColor: 'text-destructive',
            borderColor: 'border-destructive/20'
        },
        info: {
            iconBg: 'bg-info/10',
            iconColor: 'text-info',
            borderColor: 'border-info/20'
        },
        neutral: {
            iconBg: 'bg-muted',
            iconColor: 'text-muted-foreground',
            borderColor: 'border-border'
        }
    };

    const config = typeConfig[type];

    return (
        <Card className={`border-2 ${config.borderColor}`}>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${config.iconBg}`}>
                        <div className={`text-2xl font-bold ${config.iconColor}`}>
                            {value}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * NOTIFICATION ALERTS
 * Use semantic colors for different alert types
 */
export function NotificationAlert({
    type,
    message
}: {
    type: 'success' | 'warning' | 'error' | 'info';
    message: string
}) {
    const typeConfig = {
        success: {
            className: 'bg-success/10 border-success text-success-foreground',
            icon: '✓'
        },
        warning: {
            className: 'bg-warning/10 border-warning text-warning-foreground',
            icon: '⚠'
        },
        error: {
            className: 'bg-destructive/10 border-destructive text-destructive-foreground',
            icon: '✕'
        },
        info: {
            className: 'bg-info/10 border-info text-info-foreground',
            icon: 'ℹ'
        }
    };

    const config = typeConfig[type];

    return (
        <div className={`p-4 rounded-lg border-2 ${config.className}`}>
            <div className="flex items-center gap-3">
                <span className="text-xl">{config.icon}</span>
                <p className="text-sm font-medium">{message}</p>
            </div>
        </div>
    );
}

/**
 * FORM VALIDATION STATES
 * Use semantic colors for form field validation
 */
export function FormFieldWithValidation({
    label,
    error,
    success
}: {
    label: string;
    error?: string;
    success?: string
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <input
                className={`
          w-full px-3 py-2 rounded-md border
          ${error ? 'border-destructive focus:ring-destructive' : ''}
          ${success ? 'border-success focus:ring-success' : ''}
          ${!error && !success ? 'border-input focus:ring-primary' : ''}
        `}
            />
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
            {success && (
                <p className="text-sm text-success">{success}</p>
            )}
        </div>
    );
}

/**
 * PROGRESS INDICATORS
 * Use primary color for progress bars and loading states
 */
export function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="w-full bg-muted rounded-full h-2">
            <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

/**
 * CHART COLORS
 * Use chart colors for data visualization
 */
export const CHART_COLORS = {
    chart1: 'oklch(0.646 0.222 41.116)', // Green
    chart2: 'oklch(0.6 0.118 184.704)',   // Blue
    chart3: 'oklch(0.398 0.07 227.392)',  // Purple
    chart4: 'oklch(0.828 0.189 84.429)',  // Amber
    chart5: 'oklch(0.769 0.188 70.08)'    // Orange
};

// Usage in Recharts
export const chartConfig = {
    revenue: { color: CHART_COLORS.chart1 },
    expenses: { color: CHART_COLORS.chart2 },
    profit: { color: CHART_COLORS.chart3 },
    loans: { color: CHART_COLORS.chart4 },
    devices: { color: CHART_COLORS.chart5 }
};
