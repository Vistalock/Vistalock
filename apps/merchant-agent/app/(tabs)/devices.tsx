import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Smartphone, Lock, Unlock, AlertTriangle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function DevicesScreen() {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const res = await api.get('/agents/device-monitors');
                setDevices(res.data);
            } catch (error) {
                console.error('Failed to load devices', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDevices();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Monitored Devices</Text>
                <Text style={styles.subtitle}>Check the lock status of financed devices</Text>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#16A34A" />
                </View>
            ) : (
                <ScrollView style={styles.listContainer}>
                    {devices.map((device) => (
                        <View key={device.id} style={styles.deviceCard}>
                            <View style={styles.iconContainer}>
                                <Smartphone size={24} color="#64748B" />
                            </View>
                            <View style={styles.deviceInfo}>
                                <Text style={styles.model}>{device.model}</Text>
                                <Text style={styles.imei}>IMEI: {device.imei}</Text>
                                <Text style={styles.customer}>Owner: {device.customer}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                {device.status === 'UNLOCKED' && <Unlock size={20} color="#16A34A" />}
                                {device.status === 'LOCKED' && <Lock size={20} color="#EF4444" />}
                                {device.status === 'AT_RISK' && <AlertTriangle size={20} color="#D97706" />}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { padding: 24, paddingBottom: 16, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#64748B' },
    listContainer: { padding: 24 },
    deviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    deviceInfo: { flex: 1 },
    model: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 },
    imei: { fontSize: 13, color: '#475569', fontFamily: 'monospace', marginBottom: 4 },
    customer: { fontSize: 13, color: '#94A3B8' },
    statusBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
