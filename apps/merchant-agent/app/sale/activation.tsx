import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function ActivationScreen() {
    const router = useRouter();
    const [status, setStatus] = useState<'ACTIVATING' | 'SUCCESS' | 'FAILED'>('ACTIVATING');

    useEffect(() => {
        activateDevice();
    }, []);

    const activateDevice = async () => {
        try {
            // Mock Activation
            await new Promise(resolve => setTimeout(resolve, 3000));
            setStatus('SUCCESS');
        } catch (error) {
            setStatus('FAILED');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />
            <View style={{ padding: 24, flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                {status === 'ACTIVATING' && (
                    <View style={{ alignItems: 'center' }}>
                        <ActivityIndicator size={60} color={colors.primary} style={{ marginBottom: 24 }} />
                        <Text style={{ ...typography.heading.md, color: colors.text, marginBottom: 8 }}>
                            Unlocking Device...
                        </Text>
                        <Text style={{ ...typography.body.md, color: colors.textSecondary, textAlign: 'center' }}>
                            Please wait while we communicate with the VistaLock policy server.
                        </Text>
                    </View>
                )}

                {status === 'SUCCESS' && (
                    <View style={{ alignItems: 'center', width: '100%' }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <Text style={{ fontSize: 40, color: 'white' }}>✓</Text>
                        </View>
                        <Text style={{ ...typography.heading.lg, color: colors.text, marginBottom: 8, textAlign: 'center' }}>
                            Activation Complete
                        </Text>
                        <Text style={{ ...typography.body.md, color: colors.textSecondary, textAlign: 'center', marginBottom: 32 }}>
                            The device has been successfully unlocked and assigned to the customer.
                        </Text>

                        <Card style={{ width: '100%', padding: 16, backgroundColor: colors.primaryLight, marginBottom: 32 }}>
                            <Text style={{ ...typography.body.sm, color: colors.primaryDark, textAlign: 'center', fontWeight: 'bold' }}>
                                READY FOR HANDOVER
                            </Text>
                        </Card>

                        <Button
                            title="Back to Dashboard"
                            onPress={() => router.replace('/dashboard')}
                        />
                    </View>
                )}

                {status === 'FAILED' && (
                    <View style={{ alignItems: 'center', width: '100%' }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <Text style={{ fontSize: 40, color: 'white' }}>✕</Text>
                        </View>
                        <Text style={{ ...typography.heading.lg, color: colors.text, marginBottom: 8 }}>
                            Activation Failed
                        </Text>
                        <Text style={{ ...typography.body.md, color: colors.textSecondary, textAlign: 'center', marginBottom: 32 }}>
                            The device could not be unlocked. Please check internet connection or retry.
                        </Text>

                        <Button
                            title="Retry Activation"
                            onPress={() => { setStatus('ACTIVATING'); activateDevice(); }}
                            style={{ marginBottom: 16 }}
                        />
                        <Button
                            title="Return to Dashboard"
                            variant="ghost"
                            onPress={() => router.replace('/dashboard')}
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
