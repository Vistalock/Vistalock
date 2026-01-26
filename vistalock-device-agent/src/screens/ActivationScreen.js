import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DeviceManager from '../services/deviceManager';

export default function ActivationScreen({ onActivated }) {
    const [activationCode, setActivationCode] = useState('');
    const [imei, setImei] = useState('');
    const [loading, setLoading] = useState(false);

    const handleActivate = async () => {
        if (!activationCode || !imei) {
            Alert.alert('Error', 'Please enter both activation code and IMEI');
            return;
        }

        setLoading(true);
        try {
            await DeviceManager.registerDevice(activationCode, imei);
            Alert.alert('Success', 'Device activated successfully!');
            onActivated();
        } catch (error) {
            console.error('Activation failed:', error);
            Alert.alert('Activation Failed', error.response?.data?.message || 'Please check your activation code and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🛡️</Text>
                    </View>
                    <Text style={styles.title}>Vistalock Device Agent</Text>
                    <Text style={styles.subtitle}>Activate your device protection</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Activation Code</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit code"
                        value={activationCode}
                        onChangeText={setActivationCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Device IMEI</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 15-digit IMEI"
                        value={imei}
                        onChangeText={setImei}
                        keyboardType="number-pad"
                        maxLength={15}
                        autoCapitalize="none"
                    />

                    <Text style={styles.helpText}>
                        Dial *#06# to find your IMEI number
                    </Text>

                    <View style={styles.buttonContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#16a34a" />
                        ) : (
                            <View style={styles.button} onTouchEnd={handleActivate}>
                                <Text style={styles.buttonText}>Activate Device</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        This app protects your device and ensures timely payments.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#dcfce7',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    icon: {
        fontSize: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
    },
    form: {
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#0f172a',
        marginBottom: 16,
    },
    helpText: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 24,
    },
    buttonContainer: {
        marginTop: 16,
    },
    button: {
        backgroundColor: '#16a34a',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
    },
});
