/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import OpsMerchantsReadOnly from '@/components/admin/pages/OpsMerchantsReadOnly';
import dynamic from 'next/dynamic';

// Dynamically import the full merchants page to avoid loading it for Ops Admin
const FullMerchantsPage = dynamic(() => import('./MerchantsFullView'), {
    loading: () => <div className="p-4">Loading...</div>
});

export default function MerchantsPageWrapper() {
    const [userEmail, setUserEmail] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Decode JWT to get user email
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserEmail(payload.email || '');
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
        setLoading(false);
    }, []);

    if (loading) return <div className="p-4">Loading...</div>;

    // Ops Admin gets read-only view
    const isOpsAdmin = userEmail.toLowerCase().startsWith('ops@');

    if (isOpsAdmin) {
        return <OpsMerchantsReadOnly />;
    }

    // Other admins get full management view
    return <FullMerchantsPage />;
}
