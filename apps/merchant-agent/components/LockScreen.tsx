
import React from 'react';
import { View, Text, StyleSheet, Modal, Dimensions, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Lock, PhoneMissedCall, AlertTriangle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface LockScreenProps {
    visible: boolean;
    type: 'HARD_LOCK' | 'SOFT_LOCK';
    onUnlockSimulation?: () => void; // For demo purpose only
}

export function LockScreen({ visible, type, onUnlockSimulation }: LockScreenProps) {
    if (!visible) return null;

    const isHard = type === 'HARD_LOCK';

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <StatusBar style="light" />
            <View style={[styles.container, isHard ? styles.hardBg : styles.softBg]}>

                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        {isHard ? (
                            <Lock color="#fff" size={80} />
                        ) : (
                            <AlertTriangle color="#fff" size={80} />
                        )}
                    </View>

                    <Text style={styles.title}>
                        {isHard ? 'DEVICE LOCKED' : 'PAYMENT OVERDUE'}
                    </Text>

                    <Text style={styles.message}>
                        {isHard
                            ? 'This device has been locked due to non-payment. Please make a payment immediately to restore access.'
                            : 'Your repayment is overdue. Please pay now to avoid full device restriction.'}
                    </Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Outstanding Balance</Text>
                        <Text style={styles.infoValue}>₦ 34,500.00</Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.payButton} onPress={onUnlockSimulation}>
                            <Text style={styles.payButtonText}>MAKE PAYMENT</Text>
                        </TouchableOpacity>

                        {isHard && (
                            <TouchableOpacity style={styles.emergencyButton}>
                                <PhoneMissedCall color="#fff" size={20} />
                                <Text style={styles.emergencyText}>Emergency Call</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Demo Close Button (Hidden/Subtle) */}
                <TouchableOpacity onPress={onUnlockSimulation} style={styles.demoClose}>
                    <Text style={{ color: 'rgba(255,255,255,0.3)' }}>Demo: Close</Text>
                </TouchableOpacity>

            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    hardBg: {
        backgroundColor: '#ef4444', // Red-500
    },
    softBg: {
        backgroundColor: '#f59e0b', // Amber-500
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    iconContainer: {
        marginBottom: 32,
        padding: 24,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 40,
        opacity: 0.9,
    },
    infoBox: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 20,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 40,
    },
    infoLabel: {
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    infoValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '700',
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    payButton: {
        backgroundColor: '#fff',
        paddingVertical: 18,
        borderRadius: 100,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    payButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    emergencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
    },
    emergencyText: {
        color: '#fff',
        fontWeight: '600',
    },
    demoClose: {
        position: 'absolute',
        top: 60,
        right: 20,
    }
});
