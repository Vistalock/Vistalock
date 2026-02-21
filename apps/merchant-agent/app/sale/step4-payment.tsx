import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CreditCard, Banknote, ChevronRight, Check } from 'lucide-react-native';
import { useState } from 'react';
import { useSaleContext } from './SaleContext';

export default function Step4Payment() {
    const router = useRouter();
    const { product, setDownPayment } = useSaleContext();
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    const paymentMethods = [
        { id: 'transfer', name: 'Bank Transfer', icon: <Banknote size={24} color="#0F172A" /> },
        { id: 'card', name: 'Debit Card (POS)', icon: <CreditCard size={24} color="#0F172A" /> },
        { id: 'cash', name: 'Cash Deposit', icon: <Banknote size={24} color="#0F172A" /> },
    ];

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Down Payment</Text>
                    <Text style={styles.subtitle}>Record the customer's initial deposit for the {product?.name || 'Device'}.</Text>
                </View>

                {/* Amount Summary */}
                <View style={styles.amountCard}>
                    <Text style={styles.amountLabel}>Required Deposit</Text>
                    <Text style={styles.amountValue}>₦{Number(product?.minDownPayment || 0).toLocaleString()}</Text>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Device Total</Text>
                        <Text style={styles.rowValue}>₦{Number(product?.price || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Remaining Balance</Text>
                        <Text style={styles.rowValue}>₦{(Number(product?.price || 0) - Number(product?.minDownPayment || 0)).toLocaleString()}</Text>
                    </View>
                </View>

                {/* Payment Methods */}
                <Text style={styles.sectionTitle}>Select Payment Method</Text>
                <View style={styles.methodList}>
                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.methodCard,
                                selectedMethod === method.id && styles.methodCardSelected
                            ]}
                            onPress={() => setSelectedMethod(method.id)}
                        >
                            <View style={[styles.iconContainer, selectedMethod === method.id && styles.iconContainerSelected]}>
                                {method.icon}
                            </View>
                            <Text style={[styles.methodName, selectedMethod === method.id && styles.methodNameSelected]}>
                                {method.name}
                            </Text>
                            {selectedMethod === method.id && (
                                <View style={styles.checkIcon}>
                                    <Check size={20} color="#16A34A" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, !selectedMethod ? styles.buttonDisabled : null]}
                    onPress={() => {
                        setDownPayment(Number(product?.minDownPayment || 0));
                        router.push('/sale/step5-submit' as any);
                    }}
                    disabled={!selectedMethod}
                >
                    <Text style={styles.buttonText}>Confirm Deposit</Text>
                    <ChevronRight size={20} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    scroll: { flex: 1 },
    header: { padding: 24, paddingBottom: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#64748B' },
    amountCard: {
        backgroundColor: '#1E293B', // Slate 800
        marginHorizontal: 24,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    amountLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '600', marginBottom: 8 },
    amountValue: { color: '#fff', fontSize: 40, fontWeight: 'bold', marginBottom: 20 },
    divider: { width: '100%', height: 1, backgroundColor: '#334155', marginBottom: 16 },
    row: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    rowLabel: { color: '#94A3B8', fontSize: 14 },
    rowValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', paddingHorizontal: 24, marginBottom: 16 },
    methodList: { paddingHorizontal: 24, paddingBottom: 40 },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    methodCardSelected: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    iconContainerSelected: { backgroundColor: '#DCFCE7' },
    methodName: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
    methodNameSelected: { color: '#16A34A' },
    checkIcon: { marginLeft: 'auto' },
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
