import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DeviceManager from '../services/deviceManager';
import ApiService from '../services/api';

export default function NormalScreen() {
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPaymentInfo();
        // Start background monitoring
        DeviceManager.startMonitoring();
    }, []);

    const loadPaymentInfo = async () => {
        setRefreshing(true);
        try {
            const payment = await ApiService.getPaymentStatus();
            setPaymentInfo(payment);
        } catch (error) {
            console.error('Failed to load payment info:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const getStatusColor = () => {
        if (!paymentInfo) return '#64748b';
        if (paymentInfo.daysUntilDue < 0) return '#dc2626'; // Overdue
        if (paymentInfo.daysUntilDue <= 3) return '#f59e0b'; // Due soon
        return '#16a34a'; // On track
    };

    const getStatusText = () => {
        if (!paymentInfo) return 'Loading...';
        if (paymentInfo.daysUntilDue < 0) return `${Math.abs(paymentInfo.daysUntilDue)} days overdue`;
        if (paymentInfo.daysUntilDue === 0) return 'Due today';
        if (paymentInfo.daysUntilDue <= 3) return `Due in ${paymentInfo.daysUntilDue} days`;
        return 'On track';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadPaymentInfo} tintColor="#16a34a" />
                }
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>✅</Text>
                    </View>
                    <Text style={styles.title}>Device Protected</Text>
                    <Text style={styles.subtitle}>Vistalock Device Agent Active</Text>
                </View>

                {paymentInfo && (
                    <>
                        <View style={[styles.statusCard, { borderLeftColor: getStatusColor() }]}>
                            <View style={styles.statusHeader}>
                                <Text style={styles.statusLabel}>Payment Status</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor() }]}>
                                        {getStatusText()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.paymentCard}>
                            <Text style={styles.cardTitle}>Next Payment</Text>

                            <View style={styles.amountRow}>
                                <Text style={styles.amountLabel}>Amount Due:</Text>
                                <Text style={styles.amountValue}>₦{paymentInfo.nextPaymentAmount?.toLocaleString()}</Text>
                            </View>

                            <View style={styles.detailsRow}>
                                <Text style={styles.detailLabel}>Due Date:</Text>
                                <Text style={styles.detailValue}>{paymentInfo.nextDueDate}</Text>
                            </View>

                            <View style={styles.detailsRow}>
                                <Text style={styles.detailLabel}>Remaining Balance:</Text>
                                <Text style={styles.detailValue}>₦{paymentInfo.remainingBalance?.toLocaleString()}</Text>
                            </View>

                            <View style={styles.detailsRow}>
                                <Text style={styles.detailLabel}>Payments Made:</Text>
                                <Text style={styles.detailValue}>{paymentInfo.paymentsMade} of {paymentInfo.totalPayments}</Text>
                            </View>
                        </View>

                        <View style={styles.progressCard}>
                            <Text style={styles.progressLabel}>Loan Progress</Text>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${(paymentInfo.paymentsMade / paymentInfo.totalPayments) * 100}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {Math.round((paymentInfo.paymentsMade / paymentInfo.totalPayments) * 100)}% Complete
                            </Text>
                        </View>
                    </>
                )}

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>📱 Device Protection Active</Text>
                    <Text style={styles.infoText}>
                        Your device is protected by Vistalock. Make timely payments to keep your device unlocked.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Need help? Call: 0800-VISTALOCK
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 60,
        height: 60,
        backgroundColor: '#dcfce7',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    icon: {
        fontSize: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    statusCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    paymentCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
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
        fontSize: 14,
        color: '#64748b',
    },
    amountValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#16a34a',
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
    progressCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    progressLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 12,
        fontWeight: '600',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#16a34a',
    },
    progressText: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
    },
    infoCard: {
        backgroundColor: '#dbeafe',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 18,
    },
    footer: {
        alignItems: 'center',
        marginTop: 16,
    },
    footerText: {
        fontSize: 12,
        color: '#64748b',
    },
});
