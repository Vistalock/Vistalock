import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useOnboarding } from '../../context/OnboardingContext';
import { api } from '../../lib/api';

export default function EligibilityCheck() {
    const router = useRouter();
    const { data, setOnboardingData } = useOnboarding();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null); // { status: 'APPROVED' | 'REJECTED' | 'REVIEW', limit: number, score: number }

    const checkEligibility = async () => {
        setLoading(true);
        try {
            // Validate Data
            if (!data.customer.firstName || !data.device.imei || !data.selectedProduct || !data.loanPlan) {
                throw new Error('Missing application data');
            }

            // Construct Payload
            const formData = new FormData();

            // Customer
            const customerPayload = {
                firstName: data.customer.firstName,
                lastName: data.customer.lastName,
                phoneNumber: data.customer.phoneNumber,
                address: data.customer.address,
                nin: data.customer.nin
            };
            formData.append('customer', JSON.stringify(customerPayload));

            // Device
            const devicePayload = {
                name: data.selectedProduct.name,
                imei: data.device.imei,
                model: data.selectedProduct.name, // or detailed model
                specifications: {
                    ram: '4GB', // Should come from product details
                    storage: '64GB'
                }
            };
            formData.append('device', JSON.stringify(devicePayload));

            // Loan
            const loanPayload = {
                productId: data.selectedProduct.id,
                amount: data.loanPlan.totalRepayment,
                downPayment: data.loanPlan.downPayment,
                tenure: data.loanPlan.tenure,
                interestRate: 5 // should come from product
            };
            formData.append('loan', JSON.stringify(loanPayload));

            // Files
            if (data.kyc.idPhotoUri) {
                const filename = data.kyc.idPhotoUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('idCard', { uri: data.kyc.idPhotoUri, name: filename, type } as any);
            }
            if (data.kyc.selfieUri) {
                const filename = data.kyc.selfieUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('selfie', { uri: data.kyc.selfieUri, name: filename, type } as any);
            }

            // Call API
            // Note: Update URL to match AuthGateway prefix if needed
            const res = await api.post('/auth/agents/onboard', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Assuming response contains loanId/status
            const { loanId, status } = res.data;

            setResult({
                status: 'APPROVED',
                limit: data.loanPlan.totalRepayment,
                score: 750,
                message: 'Application submitted and approved.',
                loanId: loanId // Store for payment
            });

            // Update context with loanId if needed
            if (setOnboardingData) {
                setOnboardingData(prev => ({ ...prev, loanId }));
            }

        } catch (error) {
            console.error(error);
            setResult({
                status: 'REJECTED',
                message: 'Application failed or rejected.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        router.push('/sale/activation');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />
            <View style={{ padding: 24, flex: 1 }}>
                <Text style={{ ...typography.heading.lg, color: colors.text, marginBottom: 8 }}>
                    Eligibility Check
                </Text>
                <Text style={{ ...typography.body.md, color: colors.textSecondary, marginBottom: 32 }}>
                    Verifying customer's creditworthiness for BNPL.
                </Text>

                <Card style={{ padding: 32, alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                    {!result && !loading && (
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 40, marginBottom: 16 }}>🏦</Text>
                            <Button title="Check Eligibility" onPress={checkEligibility} />
                        </View>
                    )}

                    {loading && (
                        <View style={{ alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={{ ...typography.label.md, color: colors.textSecondary, marginTop: 16 }}>
                                Analyzing Data...
                            </Text>
                        </View>
                    )}

                    {result && (
                        <View style={{ alignItems: 'center', width: '100%' }}>
                            <View style={{ marginBottom: 16 }}>
                                <StatusBadge status={result.status} />
                            </View>

                            <Text style={{ ...typography.heading.md, color: colors.text, marginBottom: 8, textAlign: 'center' }}>
                                {result.status === 'APPROVED' ? 'Approved for Financing' : 'Application Rejected'}
                            </Text>

                            <Text style={{ ...typography.body.md, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
                                {result.message}
                            </Text>

                            {result.status === 'APPROVED' && (
                                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.background, padding: 16, borderRadius: 12, marginBottom: 24 }}>
                                    <View>
                                        <Text style={{ ...typography.label.sm, color: colors.textSecondary }}>Credit Limit</Text>
                                        <Text style={{ ...typography.heading.sm, color: colors.primary }}>₦{result.limit.toLocaleString()}</Text>
                                    </View>
                                    <View>
                                        <Text style={{ ...typography.label.sm, color: colors.textSecondary }}>Score</Text>
                                        <Text style={{ ...typography.heading.sm, color: colors.text }}>{result.score}/1000</Text>
                                    </View>
                                </View>
                            )}

                            <Button
                                title="Continue to Activation"
                                onPress={handleContinue}
                                disabled={result.status !== 'APPROVED'}
                                variant={result.status === 'APPROVED' ? 'primary' : 'outline'}
                            />
                        </View>
                    )}
                </Card>
            </View>
        </SafeAreaView>
    );
}
