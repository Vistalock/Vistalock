import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScanLine, ChevronRight } from 'lucide-react-native';
import { useSaleContext } from './SaleContext';

export default function Step2ScanDevice() {
    const router = useRouter();
    const { setImei } = useSaleContext();
    const [imei, setLocalImei] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const handleValidate = () => {
        setIsValidating(true);
        // Simulate IMEI validation against backend
        setTimeout(() => {
            setIsValidating(false);
            setImei(imei);
            router.push('/sale/step3-customer' as any);
        }, 1200);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Scan Device</Text>
                    <Text style={styles.subtitle}>Enter or scan the IMEI of the device to verify its eligibility.</Text>
                </View>

                {/* Scan Area Placeholder */}
                <View style={styles.scanArea}>
                    <View style={styles.scanIconContainer}>
                        <ScanLine size={48} color="#16A34A" />
                    </View>
                    <Text style={styles.scanText}>Tap to open camera scanner</Text>
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.divider} />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Enter IMEI Manually</Text>
                    <TextInput
                        style={styles.input}
                        value={imei}
                        onChangeText={setLocalImei}
                        placeholder="e.g. 359123456789012"
                        keyboardType="numeric"
                        maxLength={15}
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, (!imei || imei.length < 15) ? styles.buttonDisabled : null]}
                    onPress={handleValidate}
                    disabled={!imei || imei.length < 15 || isValidating}
                >
                    <Text style={styles.buttonText}>
                        {isValidating ? 'Validating...' : 'Continue'}
                    </Text>
                    {!isValidating && <ChevronRight size={20} color="#fff" style={{ marginLeft: 8 }} />}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    scrollContent: { padding: 24 },
    header: { marginBottom: 32 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#64748B' },
    scanArea: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    scanIconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#DCFCE7',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    scanText: { fontSize: 16, color: '#16A34A', fontWeight: '500' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    divider: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    dividerText: { color: '#94A3B8', paddingHorizontal: 16, fontWeight: '600' },
    inputGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        letterSpacing: 2,
    },
    footer: {
        padding: 24,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    button: {
        backgroundColor: '#16A34A',
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: { backgroundColor: '#94A3B8' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
