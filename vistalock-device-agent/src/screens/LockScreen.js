import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DeviceManager from '../services/deviceManager';
import ApiService from '../services/api';

export default function LockScreen() {
    const [lockReason, setLockReason] = useState('Payment overdue');
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        loadLockInfo();
    }, []);

    const loadLockInfo = async () => {
        const lockState = await DeviceManager.getLockState();
        setLockReason(lockState.lockReason || 'Payment overdue');

        try {
            const payment = await ApiService.getPaymentStatus();
            setPaymentInfo(payment);
        } catch (error) {
            console.error('Failed to load payment info:', error);
        }
    };

    const handleCheckPayment = async () => {
        setChecking(true);
        try {
            const status = await DeviceManager.checkLockStatus();

            if (!status.isLocked) {
                Alert.alert('Payment Confirmed!', 'Your device has been unlocked. Thank you for your payment.');
                // The app will automatically switch to normal screen
            } else {
                Alert.alert('Payment Not Received', 'We have not received your payment yet. Please try again in a few minutes.');
            }
        } catch (error) {
            Alert.alert('Error', 'Could not check payment status. Please ensure you have internet connection.');
        } finally {
            setChecking(false);
        }
    };

    const handleMakePayment = () => {
        if (paymentInfo?.paymentLink) {
            Linking.openURL(paymentInfo.paymentLink);
        } else {
            Alert.alert('Contact Support', 'Please contact Vistalock support to make a payment.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.lockIcon}>
                        <Text style={styles.lockEmoji}>🔒</Text>
                    </View>
                    <Text style={styles.title}>Device Locked</Text>
                    <Text style={styles.reason}>{lockReason}</Text>
                </View>

                {paymentInfo && (
                    <View style={styles.paymentCard}>
                        <Text style={styles.cardTitle}>Payment Required</Text>

                        <View style={styles.amountRow}>
                            <Text style={styles.amountLabel}>Amount Due:</Text>
                            <Text style={styles.amountValue}>₦{paymentInfo.amountDue?.toLocaleString()}</Text>
                        </View>

                        {paymentInfo.daysOverdue > 0 && (
                            <View style={styles.overdueRow}>
                                <Text style={styles.overdueText}>
                                    {paymentInfo.daysOverdue} day(s) overdue
                                </Text>
                            </View>
                        )}

                        <View style={styles.detailsRow}>
                            <Text style={styles.detailLabel}>Due Date:</Text>
                            <Text style={styles.detailValue}>{paymentInfo.dueDate}</Text>
                        </View>

                        <View style={styles.detailsRow}>
                            <Text style={styles.detailLabel}>Remaining Balance:</Text>
                            <Text style={styles.detailValue}>₦{paymentInfo.remainingBalance?.toLocaleString()}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleMakePayment}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>Make Payment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleCheckPayment}
                        disabled={checking}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.secondaryButtonText}>
                            {checking ? 'Checking...' : 'I Already Paid'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Your device will unlock automatically once payment is confirmed.
                    </Text>
                    <Text style={styles.supportText}>
                        Need help? Call: 0800-VISTALOCK
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dc2626', // Red background for locked state
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    lockIcon: {
        width: 100,
        height: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    lockEmoji: {
        fontSize: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 8,
    },
    reason: {
        fontSize: 16,
        color: '#fecaca',
    },
    paymentCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    amountLabel: {
        fontSize: 16,
        color: '#64748b',
    },
    amountValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#dc2626',
    },
    overdueRow: {
        backgroundColor: '#fef3c7',
        padding: 8,
        borderRadius: 8,
        marginBottom: 12,
    },
    overdueText: {
        fontSize: 14,
        color: '#d97706',
        textAlign: 'center',
        fontWeight: '600',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    detailValue: {
        fontSize: 14,
        color: '#0f172a',
        fontWeight: '600',
    },
    actions: {
        marginBottom: 24,
    },
    primaryButton: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        color: '#dc2626',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    secondaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#fecaca',
        textAlign: 'center',
        marginBottom: 8,
    },
    supportText: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: '600',
    },
});
