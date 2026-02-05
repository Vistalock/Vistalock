/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>({
        businessName: '',
        email: '',
        phone: '',
        address: '',
        defaultBranch: 'Main Branch'
    });
    const [limits, setLimits] = useState({ deviceLimit: 0, agentLimit: 0 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch Merchant Profile
                const res = await api.get('/auth/merchant-profile');
                if (res.data) {
                    setProfile({
                        businessName: res.data.businessName || '',
                        email: res.data.email || '',
                        phone: res.data.phone || '',
                        address: res.data.address || '',
                        defaultBranch: res.data.defaultBranch || 'Main Branch'
                    });
                }

                // Fetch User Details for limits (fetched via /auth/profile or derived)
                const userRes = await api.get('/auth/profile');
                if (userRes.data) {
                    // Assuming limits are stored on user or we derive them from plan
                    // For MVP, using placeholder or subscriptionPlan
                    setLimits({
                        deviceLimit: userRes.data.subscriptionPlan === 'STARTER' ? 20 : 200,
                        agentLimit: 5
                    });
                    // Overwrite email from user account if profile is empty
                    if (!res.data?.email) setProfile((prev: any) => ({ ...prev, email: userRes.data.email }));
                }

            } catch (error) {
                console.error('Failed to fetch settings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/auth/merchant-profile', profile);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings', error);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings & Configuration</h1>
                <p className="text-muted-foreground">Manage your merchant profile and operational preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Merchant Profile</CardTitle>
                        <CardDescription>Your business details as seen by VistaLock.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Business Name</Label>
                            <Input
                                value={profile.businessName}
                                onChange={e => setProfile({ ...profile, businessName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={profile.email} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={profile.phone}
                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input
                                value={profile.address}
                                onChange={e => setProfile({ ...profile, address: e.target.value })}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Operational Settings</CardTitle>
                        <CardDescription>Configure branch locations and limits.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Default Branch</Label>
                            <Input
                                value={profile.defaultBranch}
                                onChange={e => setProfile({ ...profile, defaultBranch: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Agents (Limit)</Label>
                            <Input value={limits.agentLimit} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">Contact support to increase limit.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Max Devices (Limit)</Label>
                            <Input value={limits.deviceLimit} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">Contact support to increase limit.</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSave} disabled={saving} variant="outline">
                            Save Preferences
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
