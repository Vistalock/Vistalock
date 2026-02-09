'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { loanPartnerService, type CreateLoanPartnerDto, type UpdateLoanPartnerDto, type LoanPartner } from '@/lib/services/loanPartnerService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface LoanPartnerFormProps {
    partner?: LoanPartner;
    mode: 'create' | 'edit';
}

export function LoanPartnerForm({ partner, mode }: LoanPartnerFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isActive, setIsActive] = useState(partner?.isActive ?? true);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateLoanPartnerDto | UpdateLoanPartnerDto>({
        defaultValues: partner ? {
            name: partner.name,
            slug: partner.slug,
            description: partner.description || '',
            logoUrl: partner.logoUrl || '',
            contactEmail: partner.contactEmail || '',
            contactPhone: partner.contactPhone || '',
            webhookUrl: partner.webhookUrl || '',
        } : {},
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: loanPartnerService.create,
        onSuccess: (data) => {
            toast({
                title: 'Success',
                description: 'Loan partner created successfully',
            });
            // Show API credentials
            router.push(`/dashboard/loan-partners/${data.id}/credentials?new=true`);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create loan partner',
                variant: 'destructive',
            });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: UpdateLoanPartnerDto) => loanPartnerService.update(partner!.id, data),
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Loan partner updated successfully',
            });
            router.push('/dashboard/loan-partners');
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update loan partner',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: CreateLoanPartnerDto | UpdateLoanPartnerDto) => {
        const formData = {
            ...data,
            ...(mode === 'edit' && { isActive }),
        };

        if (mode === 'create') {
            createMutation.mutate(formData as CreateLoanPartnerDto);
        } else {
            updateMutation.mutate(formData as UpdateLoanPartnerDto);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/loan-partners">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {mode === 'create' ? 'Add Loan Partner' : 'Edit Loan Partner'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {mode === 'create'
                            ? 'Create a new loan partner integration'
                            : 'Update loan partner information'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Enter the basic details for the loan partner
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Partner Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Acme Finance"
                                    {...register('name', { required: 'Partner name is required' })}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">
                                    Slug <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="slug"
                                    placeholder="e.g., acme-finance"
                                    {...register('slug', {
                                        required: 'Slug is required',
                                        pattern: {
                                            value: /^[a-z0-9-]+$/,
                                            message: 'Slug must contain only lowercase letters, numbers, and hyphens',
                                        },
                                    })}
                                />
                                {errors.slug && (
                                    <p className="text-sm text-destructive">{errors.slug.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Unique identifier (lowercase, hyphens only)
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of the loan partner..."
                                rows={3}
                                {...register('description')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logoUrl">Logo URL</Label>
                            <Input
                                id="logoUrl"
                                type="url"
                                placeholder="https://example.com/logo.png"
                                {...register('logoUrl')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>
                            Contact details for the loan partner
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Contact Email</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    placeholder="contact@partner.com"
                                    {...register('contactEmail', {
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                />
                                {errors.contactEmail && (
                                    <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">Contact Phone</Label>
                                <Input
                                    id="contactPhone"
                                    type="tel"
                                    placeholder="+234 XXX XXX XXXX"
                                    {...register('contactPhone')}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Webhook Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Webhook Configuration</CardTitle>
                        <CardDescription>
                            Configure webhook URL for receiving loan updates
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="webhookUrl">Webhook URL</Label>
                            <Input
                                id="webhookUrl"
                                type="url"
                                placeholder="https://partner.com/webhooks/vistalock"
                                {...register('webhookUrl', {
                                    pattern: {
                                        value: /^https?:\/\/.+/,
                                        message: 'Must be a valid URL',
                                    },
                                })}
                            />
                            {errors.webhookUrl && (
                                <p className="text-sm text-destructive">{errors.webhookUrl.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                URL where we'll send loan status updates
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Status (Edit mode only) */}
                {mode === 'edit' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                            <CardDescription>
                                Enable or disable this loan partner
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="isActive" className="text-base">Active Status</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {isActive
                                            ? 'Partner can create new loans'
                                            : 'Partner cannot create new loans'}
                                    </p>
                                </div>
                                <Switch
                                    id="isActive"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {mode === 'create' ? 'Create Loan Partner' : 'Save Changes'}
                    </Button>
                    <Link href="/dashboard/loan-partners">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
