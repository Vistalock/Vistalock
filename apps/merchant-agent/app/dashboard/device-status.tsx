
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Search, Smartphone, Lock, Unlock, ShieldAlert } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { api } from '../../lib/api';
import { LockScreen } from '../../components/LockScreen';

export default function DeviceStatusScreen() {
    const router = useRouter();
    const [imei, setImei] = useState('');
    const [loading, setLoading] = useState(false);
    const [deviceData, setDeviceData] = useState<any>(null);
    const [showLockDemo, setShowLockDemo] = useState(false);

    const handleSearch = async () => {
        if (!imei || imei.length < 10) {
            Alert.alert('Invalid IMEI', 'Please enter a valid IMEI number');
            return;
        }

        setLoading(true);
        setDeviceData(null);
        try {
            // Fetch policy from backend
            const res = await api.get(`/device-control/policy/${imei}`);
            setDeviceData(res.data);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Not Found', 'Device not found or error fetching status.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'LOCKED' || status === 'DEFAULTED') return colors.error;
        if (status === 'SOFT_LOCK') return '#f59e0b'; // Amber
        return colors.success;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />

            {/* Demo Lock Overlay */}
            <LockScreen
                visible={showLockDemo}
                type={deviceData?.lockState === 'SOFT_LOCK' ? 'SOFT_LOCK' : 'HARD_LOCK'}
                onUnlockSimulation={() => setShowLockDemo(false)}
            />

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <Text style={{ ...typography.heading.lg, color: colors.text, marginBottom: 8 }}>
                    Device Status
                </Text>
                <Text style={{ ...typography.body, color: colors.textSecondary, marginBottom: 24 }}>
                    Check real-time lock status of financed devices.
                </Text>

                <Card variant="elevated" style={{ padding: 16, marginBottom: 24 }}>
                    <Text style={{ ...typography.label.sm, marginBottom: 8 }}>IMEI Number</Text>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Device IMEI"
                            value={imei}
                            onChangeText={setImei}
                            keyboardType="numeric"
                            maxLength={15}
                        />
                        <Button
                            title={loading ? "..." : "Check"}
                            onPress={handleSearch}
                            disabled={loading}
                            style={{ height: 48, minWidth: 80, marginLeft: 8 }}
                        />
                    </View>
                </Card>

                {deviceData && (
                    <View style={styles.resultContainer}>
                        <View style={[styles.statusHeader, { backgroundColor: getStatusColor(deviceData.lockState) }]}>
                            {deviceData.lockState === 'LOCKED' ? (
                                <Lock color="#fff" size={32} />
                            ) : deviceData.lockState === 'SOFT_LOCK' ? (
                                <ShieldAlert color="#fff" size={32} />
                            ) : (
                                <Unlock color="#fff" size={32} />
                            )}
                            <Text style={styles.statusText}>{deviceData.lockState}</Text>
                        </View>

                        <Card variant="outlined" style={{ padding: 20, marginTop: -20, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Last Synced:</Text>
                                <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Policy:</Text>
                                <Text style={styles.value}>Remote Managed</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Outstanding:</Text>
                                <Text style={styles.value}>₦ --</Text>
                            </View>

                            {(deviceData.lockState === 'LOCKED' || deviceData.lockState === 'SOFT_LOCK') && (
                                <Button
                                    title="View Lock Screen (Demo)"
                                    onPress={() => setShowLockDemo(true)}
                                    variant="outline"
                                    style={{ marginTop: 16 }}
                                />
                            )}
                        </Card>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    resultContainer: {
        marginTop: 16,
    },
    statusHeader: {
        padding: 32,
        alignItems: 'center',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        gap: 12,
        zIndex: 1,
    },
    statusText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border + '50',
    },
    label: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    value: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
});
