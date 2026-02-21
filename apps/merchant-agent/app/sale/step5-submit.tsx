import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { CheckCircle2, AlertCircle, RefreshCcw, WifiOff } from 'lucide-react-native';
import { useSaleContext } from './SaleContext';
import { api } from '../../lib/api';
import { syncService } from '../../lib/sync';

export default function Step5Submit() {
    const router = useRouter();
    const { product, customerInfo, downPayment, imei, tenureMonths, resetSale } = useSaleContext();
    const [status, setStatus] = useState<'review' | 'submitting' | 'approved' | 'rejected' | 'offline'>('review');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async () => {
        setStatus('submitting');
        setErrorMessage('');

        const payload = {
            productId: product?.id,
            imei,
            phoneNumber: customerInfo?.phone,
            firstName: customerInfo?.firstName,
            lastName: customerInfo?.lastName,
            nin: customerInfo?.nin || '99999999999', // Mock NIN requirement
            address: customerInfo?.address,
            downPayment,
            tenureMonths: product?.minTenure || 3
        };

        try {
            // Simplified without image upload for now (MVP flow)
            await api.post('/agents/sales/new', payload);
            setStatus('approved');
            resetSale();
        } catch (error: any) {
            console.error('Submission failed', error);

            // Determine if it is a network error
            if (error.message === 'Network Error' || !error.response) {
                console.log('Network error detected. Saving to offline queue.');
                await syncService.enqueueSale(payload);
                setStatus('offline');
                resetSale();
                return;
            }

            setStatus('rejected');
            setErrorMessage(error.response?.data?.message || 'The application failed processing.');
        }
    };

    if (status === 'submitting') {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={styles.processingTitle}>Awaiting Credit Engine</Text>
                <Text style={styles.processingText}>Please wait while VistaLock analyzes the application. Do not close this screen.</Text>
            </View>
        );
    }

    if (status === 'approved') {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.iconCircleSuccess}>
                    <CheckCircle2 size={48} color="#16A34A" />
                </View>
                <Text style={styles.resultTitle}>Loan Approved!</Text>
                <Text style={styles.resultText}>The device can now be handed to the customer. Their repayment schedule has been activated.</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)' as any)}>
                    <Text style={styles.buttonText}>Return to Dashboard</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (status === 'rejected') {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.iconCircleError}>
                    <AlertCircle size={48} color="#EF4444" />
                </View>
                <Text style={styles.resultTitle}>Application Failed</Text>
                <Text style={styles.resultText}>{errorMessage}</Text>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/(tabs)' as any)}>
                    <Text style={styles.secondaryButtonText}>Return to Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.secondaryButton, { marginTop: 12 }]} onPress={() => setStatus('review')}>
                    <Text style={styles.secondaryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (status === 'offline') {
        return (
            <View style={styles.centerContainer}>
                <View style={[styles.iconCircleSuccess, { backgroundColor: '#FEF3C7' }]}>
                    <WifiOff size={48} color="#D97706" />
                </View>
                <Text style={styles.resultTitle}>Saved Offline</Text>
                <Text style={styles.resultText}>No internet connection. The sale has been queued and will automatically sync when you are back online.</Text>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#D97706' }]} onPress={() => router.replace('/(tabs)' as any)}>
                    <Text style={styles.buttonText}>Return to Dashboard</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Final Review</Text>
                <Text style={styles.subtitle}>Ensure all details are correct before sending to the Credit Engine.</Text>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>{product?.name || 'Device'}</Text>
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Customer</Text>
                    <Text style={styles.rowValue}>{customerInfo?.firstName} {customerInfo?.lastName}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Down Payment</Text>
                    <Text style={styles.rowValue}>₦{downPayment.toLocaleString()}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Device IMEI</Text>
                    <Text style={styles.rowValue}>{imei}</Text>
                </View>
            </View>

            <View style={styles.warningBox}>
                <AlertCircle size={20} color="#F59E0B" />
                <Text style={styles.warningText}>Once submitted, the final decision lies entirely with the Loan Partner's Credit Engine.</Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit Application</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    centerContainer: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', padding: 24 },
    header: { padding: 24, paddingBottom: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#64748B' },
    summaryCard: {
        backgroundColor: '#fff',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 24
    },
    summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    rowLabel: { color: '#64748B', fontSize: 15 },
    rowValue: { color: '#0F172A', fontSize: 15, fontWeight: '600' },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: '#FEF3C7',
        marginHorizontal: 24,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    warningText: { color: '#B45309', fontSize: 14, marginLeft: 12, flex: 1, fontWeight: '500' },
    processingTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginTop: 24, marginBottom: 8 },
    processingText: { fontSize: 15, color: '#64748B', textAlign: 'center', paddingHorizontal: 32 },
    iconCircleSuccess: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    iconCircleError: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
    resultText: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32 },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    primaryButton: {
        backgroundColor: '#16A34A',
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    secondaryButton: {
        backgroundColor: '#fff',
        width: '100%',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    secondaryButtonText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
});
