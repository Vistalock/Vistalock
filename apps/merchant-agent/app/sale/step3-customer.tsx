import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Camera, ChevronRight, Upload } from 'lucide-react-native';
import { useSaleContext } from './SaleContext';

export default function Step3CustomerDetails() {
    const router = useRouter();
    const { setCustomerInfo } = useSaleContext();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
    });

    const isFormValid = formData.firstName && formData.lastName && formData.phone.length > 10 && formData.address;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView style={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Customer Details</Text>
                    <Text style={styles.subtitle}>Enter the customer's personal info and capture required documents.</Text>
                </View>

                {/* Personal Info Form */}
                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>First Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.firstName}
                            onChangeText={(t) => setFormData({ ...formData, firstName: t })}
                            placeholder="e.g. John"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Last Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.lastName}
                            onChangeText={(t) => setFormData({ ...formData, lastName: t })}
                            placeholder="e.g. Doe"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.phone}
                            onChangeText={(t) => setFormData({ ...formData, phone: t })}
                            placeholder="e.g. 08012345678"
                            keyboardType="phone-pad"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Home Address</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.address}
                            onChangeText={(t) => setFormData({ ...formData, address: t })}
                            placeholder="Full residential address"
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                {/* Document Uploads */}
                <Text style={styles.sectionTitle}>Required Documents</Text>
                <View style={styles.uploadGrid}>
                    <TouchableOpacity style={styles.uploadCard}>
                        <View style={styles.iconCircle}>
                            <Camera size={24} color="#0EA5E9" />
                        </View>
                        <Text style={styles.uploadTitle}>Take Selfie</Text>
                        <Text style={styles.uploadSubtitle}>Clear photo of face</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.uploadCard}>
                        <View style={styles.iconCircle}>
                            <Upload size={24} color="#F59E0B" />
                        </View>
                        <Text style={styles.uploadTitle}>Upload ID</Text>
                        <Text style={styles.uploadSubtitle}>NIN, Voter's Card, etc.</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, !isFormValid ? styles.buttonDisabled : null]}
                    onPress={() => {
                        setCustomerInfo(formData);
                        router.push('/sale/step4-payment' as any);
                    }}
                    disabled={!isFormValid}
                >
                    <Text style={styles.buttonText}>Continue to Payment</Text>
                    <ChevronRight size={20} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    scroll: { flex: 1 },
    header: { padding: 24, paddingBottom: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#64748B' },
    formSection: { paddingHorizontal: 24, marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#0F172A',
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', paddingHorizontal: 24, marginBottom: 16 },
    uploadGrid: { flexDirection: 'row', paddingHorizontal: 20, justifyContent: 'space-between' },
    uploadCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 4,
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    uploadTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
    uploadSubtitle: { fontSize: 12, color: '#64748B', textAlign: 'center' },
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
