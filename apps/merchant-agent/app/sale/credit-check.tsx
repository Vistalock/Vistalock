import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useOnboarding } from '../../context/OnboardingContext';
import DojahService from '../../lib/dojah';

export default function CreditCheckScreen() {
    const router = useRouter();
    const { data, setCreditScore } = useOnboarding();

    const [checking, setChecking] = useState(true);
    const [decision, setDecision] = useState<'APPROVED' | 'APPROVED_WITH_LIMIT' | 'REJECTED' | null>(null);
    const [maxLoanAmount, setMaxLoanAmount] = useState<number>(0);
    const [rating, setRating] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        performCreditCheck();
    }, []);

    const performCreditCheck = async () => {
        setChecking(true);
        setError(null);

        try {
            // Ensure we have required data
            if (!data.userId || !data.customer.nin) {
                throw new Error('Missing customer information. Please complete previous steps.');
            }

            // Call Dojah credit check API
            const result = await DojahService.checkCreditScore(data.userId, data.customer.nin);

            // Determine decision based on qualification
            let decisionType: 'APPROVED' | 'APPROVED_WITH_LIMIT' | 'REJECTED';

            if (!result.qualified) {
                decisionType = 'REJECTED';
            } else if (result.score >= 650) {
                decisionType = 'APPROVED';
            } else {
                decisionType = 'APPROVED_WITH_LIMIT';
            }

            setDecision(decisionType);
            setMaxLoanAmount(result.maxLoanAmount || 0);

            // Get rating from score
            const creditRating = DojahService.getCreditRating(result.score);
            setRating(creditRating);

            // Store in context (but don't expose score to UI)
            setCreditScore({
                score: result.score,
                rating: creditRating,
                qualified: result.qualified,
                maxLoanAmount: result.maxLoanAmount,
            });

        } catch (error: any) {
            console.error('Credit check failed:', error);
            setError(error?.message || 'Credit check failed. Please try again.');
        } finally {
            setChecking(false);
        }
    };

    const handleContinue = () => {
        if (decision === 'REJECTED') {
            Alert.alert(
                'Cannot Continue',
                'This customer is not eligible for BNPL at this time. Please inform the customer.',
                [{ text: 'OK' }]
            );
            return;
        }

        router.push('/sale/device-selection');
    };

    const handleRetry = () => {
        performCreditCheck();
    };

    const getDecisionColor = () => {
        switch (decision) {
            case 'APPROVED': return colors.success;
            case 'APPROVED_WITH_LIMIT': return colors.warning;
            case 'REJECTED': return colors.error;
            default: return colors.textSecondary;
        }
    };

    const getDecisionIcon = () => {
        switch (decision) {
            case 'APPROVED': return '✅';
            case 'APPROVED_WITH_LIMIT': return '⚠️';
            case 'REJECTED': return '❌';
            default: return '⏳';
        }
    };

    const getDecisionTitle = () => {
        switch (decision) {
            case 'APPROVED': return 'Credit Approved';
            case 'APPROVED_WITH_LIMIT': return 'Approved with Limit';
            case 'REJECTED': return 'Credit Rejected';
            default: return 'Checking Credit...';
        }
    };

    const getDecisionMessage = () => {
        switch (decision) {
            case 'APPROVED':
                return 'Customer has excellent credit standing. Proceed with device selection.';
            case 'APPROVED_WITH_LIMIT':
                return 'Customer is approved with a maximum loan limit. Please ensure the selected device is within the limit.';
            case 'REJECTED':
                return 'Customer does not meet the minimum credit requirements for BNPL. Onboarding cannot continue.';
            default:
                return 'Please wait while we verify the customer\'s creditworthiness...';
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <Text style={{ ...typography.heading.lg, color: colors.text, marginBottom: 8 }}>
                    Credit Check
                </Text>
                <Text style={{ ...typography.body.md, color: colors.textSecondary, marginBottom: 32 }}>
                    Verifying customer creditworthiness...
                </Text>

                {checking ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={{ ...typography.body.md, color: colors.textSecondary, marginTop: 16 }}>
                            Checking credit score...
                        </Text>
                        <Text style={{ ...typography.body.sm, color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
                            This may take a few seconds
                        </Text>
                    </View>
                ) : error ? (
                    <Card variant="outlined" style={{ padding: 20, borderColor: colors.error }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
                            <Text style={{ ...typography.heading.md, color: colors.error, marginBottom: 8, textAlign: 'center' }}>
                                Credit Check Failed
                            </Text>
                            <Text style={{ ...typography.body.md, color: colors.textSecondary, marginBottom: 24, textAlign: 'center' }}>
                                {error}
                            </Text>
                            <Button
                                title="Retry Credit Check"
                                onPress={handleRetry}
                                variant="primary"
                            />
                        </View>
                    </Card>
                ) : (
                    <>
                        <Card
                            variant="elevated"
                            style={{
                                padding: 24,
                                marginBottom: 24,
                                borderLeftWidth: 4,
                                borderLeftColor: getDecisionColor(),
                            }}
                        >
                            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                <Text style={{ fontSize: 64, marginBottom: 12 }}>
                                    {getDecisionIcon()}
                                </Text>
                                <Text style={{
                                    ...typography.heading.lg,
                                    color: getDecisionColor(),
                                    marginBottom: 8,
                                    textAlign: 'center',
                                }}>
                                    {getDecisionTitle()}
                                </Text>
                                <Text style={{
                                    ...typography.body.md,
                                    color: colors.textSecondary,
                                    textAlign: 'center',
                                    lineHeight: 22,
                                }}>
                                    {getDecisionMessage()}
                                </Text>
                            </View>

                            {decision !== 'REJECTED' && (
                                <View style={{
                                    backgroundColor: colors.primaryLight,
                                    padding: 16,
                                    borderRadius: 12,
                                    marginTop: 16,
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ ...typography.label.md, color: colors.textSecondary }}>
                                            Maximum Loan Amount:
                                        </Text>
                                        <Text style={{ ...typography.heading.md, color: colors.primary }}>
                                            ₦{maxLoanAmount.toLocaleString()}
                                        </Text>
                                    </View>
                                    {rating && (
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ ...typography.label.md, color: colors.textSecondary }}>
                                                Credit Rating:
                                            </Text>
                                            <Text style={{ ...typography.label.md, color: colors.primary, fontWeight: '700' }}>
                                                {rating}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </Card>

                        {decision === 'APPROVED_WITH_LIMIT' && (
                            <Card variant="outlined" style={{ padding: 16, marginBottom: 24, backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
                                <Text style={{ ...typography.label.md, color: '#d97706', marginBottom: 8 }}>
                                    ⚠️ Important Notice
                                </Text>
                                <Text style={{ ...typography.body.sm, color: '#92400e', lineHeight: 20 }}>
                                    The customer has been approved with a maximum loan limit of ₦{maxLoanAmount.toLocaleString()}.
                                    Please ensure the selected device price does not exceed this amount.
                                </Text>
                            </Card>
                        )}

                        {decision === 'REJECTED' && (
                            <Card variant="outlined" style={{ padding: 16, marginBottom: 24, backgroundColor: '#fee2e2', borderColor: '#ef4444' }}>
                                <Text style={{ ...typography.label.md, color: '#dc2626', marginBottom: 8 }}>
                                    ❌ Onboarding Cannot Continue
                                </Text>
                                <Text style={{ ...typography.body.sm, color: '#7f1d1d', lineHeight: 20 }}>
                                    This customer does not meet the minimum credit requirements.
                                    Please inform the customer that they are not eligible for BNPL at this time.
                                </Text>
                            </Card>
                        )}

                        <View style={{ marginTop: 16 }}>
                            <Button
                                title={decision === 'REJECTED' ? 'End Onboarding' : 'Continue to Device Selection'}
                                onPress={handleContinue}
                                variant={decision === 'REJECTED' ? 'outline' : 'primary'}
                            />
                        </View>

                        <View style={{ marginTop: 16, padding: 16, backgroundColor: '#dbeafe', borderRadius: 12 }}>
                            <Text style={{ ...typography.label.sm, color: colors.textSecondary, marginBottom: 4 }}>
                                💡 Note for Agents
                            </Text>
                            <Text style={{ ...typography.body.xs, color: colors.textSecondary, lineHeight: 18 }}>
                                The actual credit score is not displayed to protect customer privacy.
                                Only the approval decision and maximum loan amount are shown.
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
