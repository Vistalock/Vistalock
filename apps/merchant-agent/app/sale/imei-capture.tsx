import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useOnboarding } from '../../context/OnboardingContext';
import { validateIMEIComplete, parseIMEIFromBarcode, formatIMEI } from '../../lib/imeiValidation';
import { api } from '../../lib/api';

export default function IMEICaptureScreen() {
    const router = useRouter();
    const { updateDevice, data } = useOnboarding();

    const [imei, setImei] = useState(data.device.imei || '');
    const [imeiError, setImeiError] = useState('');
    const [imeiValid, setImeiValid] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState<{ tac: string; brand?: string } | null>(null);

    // Scanner state
    const [showScanner, setShowScanner] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    // Validation state
    const [checking, setChecking] = useState(false);
    const [duplicateCheck, setDuplicateCheck] = useState(false);

    // Help modal
    const [showHelpModal, setShowHelpModal] = useState(false);

    useEffect(() => {
        // Optional: Auto-request on mount or wait for user interaction
    }, []);

    const handleRequestPermission = async () => {
        if (!permission?.granted) {
            await requestPermission();
        }
    };

    const handleIMEIChange = (value: string) => {
        // Only allow digits
        const cleaned = value.replace(/\D/g, '');
        setImei(cleaned);
        setImeiError('');
        setImeiValid(false);
        setDeviceInfo(null);

        // Auto-validate when 15 digits entered
        if (cleaned.length === 15) {
            validateIMEIInput(cleaned);
        }
    };

    const validateIMEIInput = (imeiValue: string) => {
        const validation = validateIMEIComplete(imeiValue);

        if (!validation.valid) {
            setImeiError(validation.error || 'Invalid IMEI');
            setImeiValid(false);
            return false;
        }

        setImeiValid(true);
        setDeviceInfo(validation.deviceInfo || null);
        return true;
    };

    const handleBarCodeScanned = ({ type, data: barcodeData }: { type: string; data: string }) => {
        if (scanned) return;
        setScanned(true);
        setShowScanner(false);

        // Parse IMEI from barcode
        const parsedIMEI = parseIMEIFromBarcode(barcodeData);

        if (parsedIMEI) {
            setImei(parsedIMEI);
            validateIMEIInput(parsedIMEI);
            Alert.alert('IMEI Scanned', `IMEI: ${formatIMEI(parsedIMEI)}`);
        } else {
            Alert.alert('Scan Failed', 'Could not extract IMEI from barcode. Please enter manually.');
        }

        // Reset scanner for next scan
        setTimeout(() => setScanned(false), 2000);
    };

    const handleCheckDuplicate = async () => {
        if (!imeiValid) {
            Alert.alert('Invalid IMEI', 'Please enter a valid 15-digit IMEI first.');
            return;
        }

        setDuplicateCheck(true);
        try {
            const response = await api.post('/device/check-duplicate-imei', {
                imei,
            });

            if (response.data.isDuplicate) {
                Alert.alert(
                    'Duplicate IMEI',
                    `This device (IMEI: ${formatIMEI(imei)}) is already registered in the system.`,
                    [{ text: 'OK' }]
                );
                setImeiError('Device already financed');
                setImeiValid(false);
            } else {
                Alert.alert('✅ IMEI Verified', 'Device is not registered. You can proceed.');
            }
        } catch (error: any) {
            console.error('Duplicate check failed:', error);
            // If check fails, allow to proceed (don't block onboarding)
            Alert.alert('Warning', 'Could not verify IMEI uniqueness. Proceeding with caution.');
        } finally {
            setDuplicateCheck(false);
        }
    };

    const handleContinue = async () => {
        // Validate IMEI
        if (!imei || imei.length !== 15) {
            Alert.alert('IMEI Required', 'Please enter a valid 15-digit IMEI.');
            return;
        }

        if (!imeiValid) {
            Alert.alert('Invalid IMEI', 'Please enter a valid IMEI number.');
            return;
        }

        // Check for duplicate
        setChecking(true);
        try {
            const response = await api.post('/device/check-duplicate-imei', {
                imei,
            });

            if (response.data.isDuplicate) {
                Alert.alert(
                    'Duplicate Device',
                    'This device is already registered. Cannot proceed with onboarding.',
                    [{ text: 'OK' }]
                );
                setChecking(false);
                return;
            }
        } catch (error: any) {
            console.error('Duplicate check failed:', error);
            // Allow to proceed if check fails
        }

        // Save IMEI
        updateDevice({
            imei,
            model: deviceInfo?.brand || 'Unknown',
        });

        setChecking(false);
        router.push('/sale/consent');
    };

    const openScanner = async () => {
        if (!permission) {
            await requestPermission();
            return;
        }

        if (!permission.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert(
                    'Camera Permission Denied',
                    'Please enable camera permission in settings to scan barcodes.',
                    [{ text: 'OK' }]
                );
                return;
            }
        }

        setShowScanner(true);
        setScanned(false);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <Text style={{ ...typography.heading.lg, color: colors.text, marginBottom: 8 }}>
                    Device IMEI
                </Text>
                <Text style={{ ...typography.body.md, color: colors.textSecondary, marginBottom: 32 }}>
                    Scan or enter the device IMEI number
                </Text>

                {/* Scanner Button */}
                <Card variant="outlined" style={{ padding: 16, marginBottom: 24, backgroundColor: colors.primaryLight }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 32, marginRight: 12 }}>📷</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ ...typography.label.md, color: colors.text, marginBottom: 4 }}>
                                Scan Barcode
                            </Text>
                            <Text style={{ ...typography.body.sm, color: colors.textSecondary }}>
                                Fastest and most accurate method
                            </Text>
                        </View>
                    </View>
                    <Button
                        title="Open Barcode Scanner"
                        onPress={openScanner}
                        variant="primary"
                    />
                </Card>

                {/* Manual Entry */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                        <Text style={{ ...typography.body.sm, color: colors.textSecondary, marginHorizontal: 16 }}>
                            OR ENTER MANUALLY
                        </Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                    </View>

                    <Input
                        label="IMEI Number"
                        placeholder="Enter 15-digit IMEI"
                        value={imei}
                        onChangeText={handleIMEIChange}
                        keyboardType="number-pad"
                        maxLength={15}
                        error={imeiError}
                        containerStyle={{ marginBottom: 0 }}
                    />

                    {imeiValid && (
                        <View style={{ marginTop: 12, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Text style={{ fontSize: 16, marginRight: 8 }}>✓</Text>
                                <Text style={{ ...typography.label.md, color: colors.success }}>
                                    Valid IMEI
                                </Text>
                            </View>
                            <Text style={{ ...typography.body.sm, color: colors.textSecondary }}>
                                Formatted: {formatIMEI(imei)}
                            </Text>
                            {deviceInfo?.brand && (
                                <Text style={{ ...typography.body.sm, color: colors.textSecondary, marginTop: 4 }}>
                                    Device: {deviceInfo.brand}
                                </Text>
                            )}
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={() => setShowHelpModal(true)}
                        style={{ marginTop: 12 }}
                    >
                        <Text style={{ ...typography.body.sm, color: colors.primary, textDecorationLine: 'underline' }}>
                            How to find IMEI?
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Duplicate Check */}
                {imeiValid && (
                    <Card variant="outlined" style={{ padding: 16, marginBottom: 24 }}>
                        <Text style={{ ...typography.label.md, color: colors.text, marginBottom: 8 }}>
                            Verify Device
                        </Text>
                        <Text style={{ ...typography.body.sm, color: colors.textSecondary, marginBottom: 12 }}>
                            Check if this device has been previously financed
                        </Text>
                        <Button
                            title={duplicateCheck ? "Checking..." : "Check for Duplicate"}
                            onPress={handleCheckDuplicate}
                            variant="outline"
                            loading={duplicateCheck}
                        />
                    </Card>
                )}

                {/* Continue Button */}
                <Button
                    title="Continue to Consent"
                    onPress={handleContinue}
                    disabled={!imeiValid}
                    loading={checking}
                />

                {/* Info Card */}
                <Card variant="outlined" style={{ padding: 16, marginTop: 16, backgroundColor: '#dbeafe' }}>
                    <Text style={{ ...typography.label.sm, color: colors.textSecondary, marginBottom: 4 }}>
                        💡 IMEI Information
                    </Text>
                    <Text style={{ ...typography.body.xs, color: colors.textSecondary, lineHeight: 18 }}>
                        The IMEI (International Mobile Equipment Identity) is a unique 15-digit number that identifies the device.
                        It's used to prevent fraud and ensure the device hasn't been previously financed.
                    </Text>
                </Card>
            </ScrollView>

            {/* Barcode Scanner Modal */}
            <Modal
                visible={showScanner}
                animationType="slide"
                onRequestClose={() => setShowScanner(false)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
                    <View style={{ flex: 1 }}>
                        <CameraView
                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                            style={StyleSheet.absoluteFillObject}
                        />

                        {/* Scanner Overlay */}
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: 250, height: 250, borderWidth: 2, borderColor: '#fff', borderRadius: 12 }} />
                            <Text style={{ color: '#fff', marginTop: 20, fontSize: 16 }}>
                                Align barcode within frame
                            </Text>
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => setShowScanner(false)}
                            style={{ position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 8 }}
                        >
                            <Text style={{ color: '#fff', fontSize: 16 }}>✕ Close</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>

            {/* Help Modal */}
            <Modal
                visible={showHelpModal}
                animationType="fade"
                transparent
                onRequestClose={() => setShowHelpModal(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
                    <Card variant="elevated" style={{ padding: 24 }}>
                        <Text style={{ ...typography.heading.md, color: colors.text, marginBottom: 16 }}>
                            How to Find IMEI
                        </Text>

                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ ...typography.label.md, color: colors.text, marginBottom: 8 }}>
                                Method 1: Dial Code
                            </Text>
                            <Text style={{ ...typography.body.sm, color: colors.textSecondary }}>
                                Dial *#06# on the device to display the IMEI
                            </Text>
                        </View>

                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ ...typography.label.md, color: colors.text, marginBottom: 8 }}>
                                Method 2: Device Settings
                            </Text>
                            <Text style={{ ...typography.body.sm, color: colors.textSecondary }}>
                                Go to Settings → About Phone → Status → IMEI
                            </Text>
                        </View>

                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ ...typography.label.md, color: colors.text, marginBottom: 8 }}>
                                Method 3: Device Box
                            </Text>
                            <Text style={{ ...typography.body.sm, color: colors.textSecondary }}>
                                Check the barcode label on the device box
                            </Text>
                        </View>

                        <Button
                            title="Got It"
                            onPress={() => setShowHelpModal(false)}
                            variant="primary"
                        />
                    </Card>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
