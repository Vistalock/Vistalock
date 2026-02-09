'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { loanPartnerService } from '@/lib/services/loanPartnerService';
import { LoanPartnerForm } from '@/components/loan-partners/LoanPartnerForm';
import { Loader2 } from 'lucide-react';

export default function EditLoanPartnerPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: partner, isLoading } = useQuery({
        queryKey: ['loanPartner', id],
        queryFn: () => loanPartnerService.getById(id),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading loan partner...</p>
                </div>
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Loan partner not found</p>
            </div>
        );
    }

    return <LoanPartnerForm partner={partner} mode="edit" />;
}
