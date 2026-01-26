import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useOnboarding } from '../../context/OnboardingContext';
import { api } from '../../lib/api';

export default function PaymentScreen() {
    const router = useRouter();
    const { data } = useOnboarding();
    const [loading, setLoading] = useState(false);

    // Default values if context missing (dev mode)
    const amount = data?.loanPlan?.downPayment || 30000;
    const deviceName = data?.selectedProduct?.name || 'Samsung Galaxy A14';

    const handleConfirmPayment = async () => {
        if (!data.loanId) {
            // Fallback for demo/dev if loanId missing
            Alert.alert('Warning', 'No Active Loan ID found. Proceeding in Demo Mode.');
            // return; // Uncomment to strict block
        }

        setLoading(true);
        try {
            if (data.loanId) {
                // Real API
                await api.post('/payments/confirm-down-payment', {
                    loanId: data.loanId,
                    amount: amount
                });
            } else {
                // Mock for Demo
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            router.push('/sale/activation');
        } catch (error) {
            console.error(error);
            Alert.alert('Payment Failed', 'Could not confirm payment. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />
            <View style={{ padding: 24, flex: 1, justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ ...typography.heading.lg, color: colors.text, marginBottom: 8 }}>
                        Down Payment
                    </Text>
                    <Text style={{ ...typography.body.md, color: colors.textSecondary, marginBottom: 32 }}>
                        Collect the down payment from the customer to unlock the device.
                    </Text>

                    <Card style={{ padding: 24, alignItems: 'center', marginBottom: 24 }} variant="elevated">
                        <Text style={{ ...typography.label.md, color: colors.textSecondary, marginBottom: 8 }}>TOTAL DUE NOW</Text>
                        <Text style={{ ...typography.heading.xl, color: colors.primary, marginBottom: 16 }}>
                            ₦{amount.toLocaleString()}
                        </Text>
                        <View style={{ height: 1, width: '100%', backgroundColor: colors.border, marginBottom: 16 }} />
                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ ...typography.body.sm, color: colors.textSecondary }}>Item</Text>
                            <Text style={{ ...typography.body.sm, color: colors.text, fontWeight: 'bold' }}>{deviceName}</Text>
                        </View>
                    </Card>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                        <Text style={{ fontSize: 24, marginRight: 8 }}>🔒</Text>
                        <Text style={{ ...typography.body.sm, color: colors.textSecondary }}>
                            Device is currently <Text style={{ color: colors.error, fontWeight: 'bold' }}>LOCKED</Text>
                        </Text>
                    </View>
                </View>

                <View>
                    <Button
                        title="Confirm Cash Received"
                        onPress={handleConfirmPayment}
                        loading={loading}
                        style={{ marginBottom: 16 }}
                    />
                    <Button
                        title="Cancel Transaction"
                        variant="ghost"
                        onPress={() => router.replace('/dashboard')}
                        textStyle={{ color: colors.error }}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
