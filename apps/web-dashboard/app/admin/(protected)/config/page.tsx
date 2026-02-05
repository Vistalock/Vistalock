/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { SudoModal } from '@/components/ui/sudo-modal';
import { Loader2, AlertTriangle, PauseCircle, PlayCircle, Save, Shield, Smartphone, Coins, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface SystemConfig {
    [key: string]: any;
}

export default function ConfigPage() {
    const [config, setConfig] = useState<SystemConfig>({
        // General
        defaultGracePeriod: 3,
        currency: 'NGN',
        strictMode: true,
        offlineLocking: true,
        emergencyPause: false,
        supportEmail: 'support@vistalock.com',
        emergencyPhone: '+234 800 VISTA',
        // Enforcement
        lockEscalationStages: ["REMINDER", "SOFT_LOCK", "FULL_LOCK"],
        lockRetryFrequency: 24,
        offlineLockTimeout: 168,
        autoUnlockOnPayment: true,
        // Device
        supportedDeviceTypes: ["ANDROID"],
        minAgentVersion: "1.0.0",
        // Risk
        defaultInterestRate: 0.0,
        defaultMaxTenure: 12
    });
    const [loading, setLoading] = useState(true);
    const [isSudoOpen, setIsSudoOpen] = useState(false);
    const [pendingConfig, setPendingConfig] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState('general');

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin/config`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data) setConfig((prev: SystemConfig) => ({ ...prev, ...res.data })); // Merge defaults
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleChange = (key: string, value: any) => {
        setConfig((prev: SystemConfig) => ({ ...prev, [key]: value }));
    };

    const handleDeviceChange = (type: string) => {
        const types = config.supportedDeviceTypes.includes(type)
            ? config.supportedDeviceTypes.filter((t: string) => t !== type)
            : [...config.supportedDeviceTypes, type];
        handleChange('supportedDeviceTypes', types);
    };

    const handleSaveGeneral = () => {
        setPendingConfig(config);
        setIsSudoOpen(true);
    };

    const handleTogglePause = () => {
        const newPauseState = !config.emergencyPause;
        setPendingConfig({ ...config, emergencyPause: newPauseState });
        setIsSudoOpen(true);
    };

    const handleSudoSuccess = async (sudoToken: string) => {
        if (!pendingConfig) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin/config`, pendingConfig, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'X-Sudo-Token': sudoToken
                }
            });
            setConfig(pendingConfig);
        } catch (err) {
            console.error(err);
            alert('Failed to update configuration');
            fetchConfig();
        } finally {
            setPendingConfig(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'enforcement', label: 'Enforcement', icon: Shield },
        { id: 'device', label: 'Device Control', icon: Smartphone },
        { id: 'risk', label: 'Risk & Credit', icon: Coins },
    ];

    return (
        <div className="space-y-6">

            {/* Danger Zone */}
            <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        <CardTitle>Emergency Controls</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-100 shadow-sm">
                        <div className="space-y-1">
                            <div className="font-semibold text-red-900 flex items-center gap-2">
                                {config.emergencyPause ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                Emergency Pause (Global Freeze)
                            </div>
                            <div className="text-sm text-red-700">
                                Stops all automated locking actions. Use only in critical incidents.
                            </div>
                        </div>
                        <Button
                            variant={config.emergencyPause ? "default" : "destructive"}
                            onClick={handleTogglePause}
                        >
                            {config.emergencyPause ? 'Resume Operations' : 'PAUSE OPERATIONS'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex space-x-2 border-b">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Defaults</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Default Grace Period (Days)</Label>
                                <Input
                                    type="number"
                                    value={config.defaultGracePeriod}
                                    onChange={(e) => handleChange('defaultGracePeriod', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select value={config.currency} onValueChange={(val) => handleChange('currency', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NGN">NGN (Nigeria)</SelectItem>
                                        <SelectItem value="KES">KES (Kenya)</SelectItem>
                                        <SelectItem value="GHS">GHS (Ghana)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Support Email</Label>
                                <Input
                                    value={config.supportEmail}
                                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Emergency Phone</Label>
                                <Input
                                    value={config.emergencyPhone}
                                    onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Enforcement Tab */}
            {activeTab === 'enforcement' && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Locking Logic</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between border p-3 rounded-lg">
                                <Label>Strict Mode (00:00 Lock)</Label>
                                <Checkbox
                                    checked={config.strictMode}
                                    onCheckedChange={(c) => handleChange('strictMode', !!c)}
                                />
                            </div>
                            <div className="flex items-center justify-between border p-3 rounded-lg">
                                <Label>Offline Locking</Label>
                                <Checkbox
                                    checked={config.offlineLocking}
                                    onCheckedChange={(c) => handleChange('offlineLocking', !!c)}
                                />
                            </div>
                            <div className="flex items-center justify-between border p-3 rounded-lg">
                                <Label>Auto-Unlock on Payment</Label>
                                <Checkbox
                                    checked={config.autoUnlockOnPayment}
                                    onCheckedChange={(c) => handleChange('autoUnlockOnPayment', !!c)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Timers & Thresholds</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Offline Lock Timeout (Hours)</Label>
                                <Input
                                    type="number"
                                    value={config.offlineLockTimeout}
                                    onChange={(e) => handleChange('offlineLockTimeout', parseInt(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">Time before device self-locks if offline (Default: 168h = 7 days)</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Lock Command Retry Frequency (Hours)</Label>
                                <Input
                                    type="number"
                                    value={config.lockRetryFrequency}
                                    onChange={(e) => handleChange('lockRetryFrequency', parseInt(e.target.value))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Device Control Tab */}
            {activeTab === 'device' && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Supported Hardware</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Allowed Device Types</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={config.supportedDeviceTypes?.includes('ANDROID')}
                                            onCheckedChange={() => handleDeviceChange('ANDROID')}
                                        />
                                        <span>Android Smartphones</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={config.supportedDeviceTypes?.includes('POS')}
                                            onCheckedChange={() => handleDeviceChange('POS')}
                                        />
                                        <span>POS Terminals</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={config.supportedDeviceTypes?.includes('TABLET')}
                                            onCheckedChange={() => handleDeviceChange('TABLET')}
                                        />
                                        <span>Tablets</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Agent Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Minimum Agent Version</Label>
                                <Input
                                    value={config.minAgentVersion}
                                    onChange={(e) => handleChange('minAgentVersion', e.target.value)}
                                    placeholder="1.0.0"
                                />
                                <p className="text-xs text-muted-foreground">Devices running older versions will be forced to update.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Risk Tab */}
            {activeTab === 'risk' && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Credit Policy Defaults</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Default Interest Rate (%)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={config.defaultInterestRate}
                                    onChange={(e) => handleChange('defaultInterestRate', parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Default Max Tenure (Months)</Label>
                                <Input
                                    type="number"
                                    value={config.defaultMaxTenure}
                                    onChange={(e) => handleChange('defaultMaxTenure', parseInt(e.target.value))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="flex justify-end pt-4">
                <Button onClick={handleSaveGeneral} size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                </Button>
            </div>

            <SudoModal
                isOpen={isSudoOpen}
                onClose={() => setIsSudoOpen(false)}
                onSuccess={handleSudoSuccess}
            />
        </div>
    );
}
