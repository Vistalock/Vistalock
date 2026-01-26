import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
// import { BarCodeScanner } from 'expo-barcode-scanner';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../../context/OnboardingContext';

export default function DeviceScanScreen() {
    const router = useRouter();
    const { updateDevice } = useOnboarding();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        // Mock permission for emulator
        setHasPermission(true);
    }, []);

    const handleBarCodeScanned = ({ type, data }: any) => {
        setScanned(true);
        try {
            // Expected Format: "IMEI:123456789012345" or JSON {"imei": "..."}
            let imei = '';
            if (data.startsWith('IMEI:')) {
                imei = data.split(':')[1];
            } else {
                const parsed = JSON.parse(data);
                imei = parsed.imei || parsed.deviceId;
            }

            if (!imei) throw new Error('Invalid QR Data');

            Alert.alert(
                'Device Detected',
                `IMEI: ${imei}\nModel: Samsung Galaxy A15 (Mock)`,
                [
                    { text: 'Retake', onPress: () => setScanned(false), style: 'cancel' },
                    {
                        text: 'Confirm',
                        onPress: () => {
                            updateDevice({ imei, model: 'Samsung Galaxy A15' });
                            router.push('/onboarding/summary');
                        }
                    }
                ]
            );
        } catch (e) {
            Alert.alert('Scan Error', 'Invalid QR Code format. Try again.', [
                { text: 'OK', onPress: () => setScanned(false) }
            ]);
        }
    };

    const simulateScan = () => {
        handleBarCodeScanned({ type: 'qr', data: 'IMEI:356478091234567' });
    };

    if (hasPermission === null) {
        return <View className="flex-1 bg-slate-900 justify-center items-center"><Text className="text-white">Requesting camera permission...</Text></View>;
    }
    if (hasPermission === false) {
        return <View className="flex-1 bg-slate-900 justify-center items-center"><Text className="text-white">No access to camera</Text></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <View className="flex-1 justify-center items-center p-6 gap-6">
                <View>
                    <Text className="text-white text-2xl font-bold text-center mb-2">Scan Device QR</Text>
                    <Text className="text-gray-400 text-center">Locate the QR code on the device box or screen.</Text>
                </View>

                <View className="w-64 h-64 border-2 border-green-500 rounded-xl overflow-hidden relative justify-center items-center bg-black">
                    <Text className="text-white text-center">Scanner Disabled in Emulator</Text>
                </View>

                <TouchableOpacity onPress={simulateScan} className="bg-slate-700 px-6 py-3 rounded-xl mt-4">
                    <Text className="text-white font-bold">Simulate Scan (Dev)</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
