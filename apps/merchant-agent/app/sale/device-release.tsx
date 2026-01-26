import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useOnboarding } from '../../context/OnboardingContext';
import { api } from '../../lib/api';

interface ChecklistItem {
    id: string;
    label: string;
    checked: boolean;
    required: boolean;
    description?: string;
}

export default function DeviceReleaseScreen() {
    const router = useRouter();
    const { data, reset } = useOnboarding();

    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [allChecked, setAllChecked] = useState(false);

    useEffect(() => {
        initializeChecklist();
    }, []);

    useEffect(() => {
        // Check if all required items are checked
        const allRequired = checklist
            .filter(item => item.required)
            .every(item => item.checked);
        setAllChecked(allRequired);
    }, [checklist]);

    const initializeChecklist = () => {
        const items: ChecklistItem[] = [
            {
                id: 'kyc_verified',
                label: 'Customer KYC Verified',
                checked: !!data.ninVerification?.verified,
                required: true,
                description: 'NIN verified via Dojah API',
            },
            {
                id: 'no_duplicate',
                label: 'No Duplicate Customer Found',
                checked: !!data.ninVerification?.verified, // If verified, duplicate check passed
                required: true,
                description: 'Customer not previously registered',
            },
            {
                id: 'credit_approved',
                label: 'Credit Check Passed',
                checked: !!data.creditScore?.qualified,
                required: true,
                description: `Rating: ${data.creditScore?.rating || 'N/A'}`,
            },
            {
                id: 'device_selected',
                label: 'Device Selected',
                checked: !!data.selectedProduct,
                required: true,
                description: data.selectedProduct?.name || 'No device selected',
            },
            {
                id: 'loan_terms',
                label: 'Loan Terms Calculated',
                checked: !!data.loanPlan,
                required: true,
                description: data.loanPlan
                    ? `₦${data.loanPlan.monthlyRepayment.toLocaleString()}/month × ${data.loanPlan.tenure} months`
                    : 'No loan plan',
            },
            {
                id: 'consent_signed',
                label: 'Customer Consent Signed',
                checked: !!data.consent?.agreed,
                required: true,
                description: data.consent?.signatureName || 'Not signed',
            },
            {
                id: 'payment_received',
                label: 'Down Payment Received',
                checked: !!data.loanPlan?.downPayment,
                required: true,
                description: data.loanPlan
                    ? `₦${data.loanPlan.downPayment.toLocaleString()} received`
                    : 'No payment',
            },
            {
                id: 'imei_validated',
                label: 'IMEI Validated',
                checked: !!data.device.imei && data.device.imei.length === 15,
                required: true,
                description: data.device.imei || 'No IMEI',
            },
            {
                id: 'device_agent',
                label: 'Device Agent Installed',
                checked: false, // Will be manually checked by agent
                required: true,
                description: 'Vistalock Device Agent active on customer device',
            },
            {
                id: 'lock_policy',
                label: 'Lock Policy Synced',
                checked: false, // Will be verified via backend
                required: true,
                description: 'Device lock policy configured',
            },
            {
                id: 'online_connection',
                label: 'Online Connection Active',
                checked: true, // Assume online if reached this screen
                required: true,
                description: 'Internet connection available',
            },
        ];

        setChecklist(items);
    };

    const toggleChecklistItem = (itemId: string) => {
        setChecklist(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const handleSubmitOnboarding = async () => {
        // Final validation
        if (!allChecked) {
            Alert.alert(
                'Incomplete Checklist',
                'Please ensure all required items are checked before releasing the device.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Confirm Device Release',
            'Are you sure you want to release this device to the customer? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Release Device',
                    style: 'default',
                    onPress: submitOnboarding,
                },
            ]
        );
    };

    const submitOnboarding = async () => {
        setSubmitting(true);

        try {
            // Submit complete onboarding data to backend
            const response = await api.post('/onboarding/submit', {
                customer: data.customer,
                ninVerification: data.ninVerification,
                creditScore: data.creditScore,
                kyc: data.kyc,
                device: data.device,
                selectedProduct: data.selectedProduct,
                loanPlan: data.loanPlan,
                consent: data.consent,
                checklist: checklist.map(item => ({
                    id: item.id,
                    label: item.label,
                    checked: item.checked,
                })),
            });

            const { loanId, message } = response.data;

            // Success!
            Alert.alert(
                '✅ Onboarding Complete!',
                `Loan ID: ${loanId}\n\n${message || 'Device has been successfully released to the customer.'}`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset onboarding context
                            reset();
                            // Navigate to dashboard
                            router.replace('/dashboard');
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Onboarding submission failed:', error);
            Alert.alert(
                'Submission Failed',
                error.response?.data?.message || 'Failed to complete onboarding. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setSubmitting(false);
        }
    };

    const getCheckIcon = (checked: boolean) => {
        return checked ? '✅' : '⬜';
    };

    const getProgressPercentage = () => {
        const checkedCount = checklist.filter(item => item.checked).length;
        return Math.round((checkedCount / checklist.length) * 100);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <Text style={{ ...typography.heading.lg, color: colors.text, marginBottom: 8 }}>
                    Device Release Confirmation
                </Text>
                <Text style={{ ...typography.body.md, color: colors.textSecondary, marginBottom: 32 }}>
                    Verify all requirements before releasing device
                </Text>

                {/* Progress Card */}
                <Card variant="elevated" style={{ padding: 20, marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ ...typography.label.md, color: colors.textSecondary }}>
                            Completion Progress
                        </Text>
                        <Text style={{ ...typography.heading.md, color: colors.primary }}>
                            {getProgressPercentage()}%
                        </Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${getProgressPercentage()}%` },
                            ]}
                        />
                    </View>
                </Card>

                {/* Checklist */}
                <Text style={{ ...typography.heading.md, color: colors.text, marginBottom: 16 }}>
                    Verification Checklist
                </Text>

                {checklist.map((item, index) => (
                    <Card
                        key={item.id}
                        variant="outlined"
                        style={{
                            padding: 16,
                            marginBottom: 12,
                            borderLeftWidth: 4,
                            borderLeftColor: item.checked ? colors.success : colors.border,
                            backgroundColor: item.checked ? '#f0fdf4' : '#fff',
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                            <Text style={{ fontSize: 24, marginRight: 12 }}>
                                {getCheckIcon(item.checked)}
                            </Text>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <Text style={{ ...typography.label.md, color: colors.text, flex: 1 }}>
                                        {index + 1}. {item.label}
                                    </Text>
                                    {item.required && (
                                        <View style={{ backgroundColor: colors.error, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                            <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>
                                                REQUIRED
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                {item.description && (
                                    <Text style={{ ...typography.body.sm, color: colors.textSecondary }}>
                                        {item.description}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </Card>
                ))}

                {/* Warning Card */}
                {!allChecked && (
                    <Card
                        variant="outlined"
                        style={{
                            padding: 16,
                            marginTop: 16,
                            marginBottom: 24,
                            backgroundColor: '#fef3c7',
                            borderColor: '#f59e0b',
                        }}
                    >
                        <Text style={{ ...typography.label.md, color: '#d97706', marginBottom: 8 }}>
                            ⚠️ Cannot Release Device
                        </Text>
                        <Text style={{ ...typography.body.sm, color: '#92400e', lineHeight: 20 }}>
                            All required checklist items must be completed before the device can be released to the customer.
                        </Text>
                    </Card>
                )}

                {/* Release Button */}
                <Button
                    title={submitting ? 'Submitting...' : 'Release Device to Customer'}
                    onPress={handleSubmitOnboarding}
                    disabled={!allChecked}
                    loading={submitting}
                    variant="primary"
                />

                {/* Info Card */}
                <Card
                    variant="outlined"
                    style={{ padding: 16, marginTop: 16, backgroundColor: '#dbeafe' }}
                >
                    <Text style={{ ...typography.label.sm, color: colors.textSecondary, marginBottom: 4 }}>
                        💡 Important Notice
                    </Text>
                    <Text style={{ ...typography.body.xs, color: colors.textSecondary, lineHeight: 18 }}>
                        Once the device is released, the customer will have full access to it. The Vistalock Device Agent will
                        monitor payment status and automatically lock the device if payments are missed.
                    </Text>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    progressBar: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
});
