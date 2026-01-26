import React, { useState } from 'react';
import { View, Text, Image, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { StepContainer } from '../../components/StepContainer';
import { Card } from '../../components/ui/Card';
import { useOnboarding } from '../../context/OnboardingContext';
import AuditLogger from '../../lib/auditLogger';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const ONBOARDING_STEPS = [
    { id: 'phone', label: 'Phone', completed: true },
    { id: 'otp', label: 'OTP', completed: true },
    { id: 'customer', label: 'Details', completed: true },
    { id: 'kyc', label: 'KYC', completed: false },
    { id: 'credit', label: 'Credit', completed: false },
    { id: 'device', label: 'Device', completed: false },
    { id: 'imei', label: 'IMEI', completed: false },
    { id: 'terms', label: 'Terms', completed: false },
    { id: 'consent', label: 'Consent', completed: false },
    { id: 'release', label: 'Release', completed: false },
];

export default function KYCCaptureScreen() {
    const router = useRouter();
    const { updateKyc, data } = useOnboarding();

    const [idPhotoUri, setIdPhotoUri] = useState(data.kyc.idPhotoUri || '');
    const [selfieUri, setSelfieUri] = useState(data.kyc.selfieUri || '');

    const requestCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === 'granted';
    };

    const captureIDPhoto = async () => {
        const hasPermission = await requestCameraPermission();

        if (!hasPermission) {
            Alert.alert('Permission Required', 'Camera permission is needed to capture ID photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setIdPhotoUri(result.assets[0].uri);
            AuditLogger.log('ID_PHOTO_CAPTURED', {}, data.userId);
        }
    };

    const captureSelfie = async () => {
        const hasPermission = await requestCameraPermission();

        if (!hasPermission) {
            Alert.alert('Permission Required', 'Camera permission is needed to capture selfie.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            cameraType: ImagePicker.CameraType.front,
        });

        if (!result.canceled && result.assets[0]) {
            setSelfieUri(result.assets[0].uri);
            AuditLogger.log('SELFIE_CAPTURED', {}, data.userId);
        }
    };

    const handleContinue = () => {
        if (!idPhotoUri || !selfieUri) {
            Alert.alert('Photos Required', 'Please capture both ID photo and selfie to continue.');
            return;
        }

        // Save KYC photos
        updateKyc({
            idPhotoUri,
            selfieUri,
        });

        AuditLogger.logStepCompleted('KYC_CAPTURE', { hasIdPhoto: true, hasSelfie: true }, data.userId);

        // Navigate to credit check
        router.push('/sale/credit-check');
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <StepContainer
            title="KYC Verification"
            subtitle="Capture customer's ID and selfie"
            onContinue={handleContinue}
            onBack={handleBack}
            continueLabel="Continue to Credit Check"
            continueDisabled={!idPhotoUri || !selfieUri}
            showProgress
            steps={ONBOARDING_STEPS}
            currentStepId="kyc"
            showBackButton
        >
            {/* ID Photo Card */}
            <Card variant="outlined" style={styles.photoCard}>
                <View style={styles.photoHeader}>
                    <Text style={styles.photoTitle}>📄 ID Card Photo</Text>
                    {idPhotoUri && (
                        <View style={styles.checkBadge}>
                            <Text style={styles.checkText}>✓</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.photoInstructions}>
                    Capture a clear photo of the customer's government-issued ID (NIN card, driver's license, or passport)
                </Text>

                {idPhotoUri ? (
                    <View style={styles.photoPreview}>
                        <Image source={{ uri: idPhotoUri }} style={styles.previewImage} />
                        <TouchableOpacity onPress={captureIDPhoto} style={styles.retakeButton}>
                            <Text style={styles.retakeText}>📷 Retake Photo</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={captureIDPhoto} style={styles.captureButton}>
                        <Text style={styles.captureIcon}>📷</Text>
                        <Text style={styles.captureText}>Capture ID Photo</Text>
                    </TouchableOpacity>
                )}
            </Card>

            {/* Selfie Card */}
            <Card variant="outlined" style={styles.photoCard}>
                <View style={styles.photoHeader}>
                    <Text style={styles.photoTitle}>🤳 Customer Selfie</Text>
                    {selfieUri && (
                        <View style={styles.checkBadge}>
                            <Text style={styles.checkText}>✓</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.photoInstructions}>
                    Capture a clear selfie of the customer's face for identity verification
                </Text>

                {selfieUri ? (
                    <View style={styles.photoPreview}>
                        <Image source={{ uri: selfieUri }} style={styles.previewImage} />
                        <TouchableOpacity onPress={captureSelfie} style={styles.retakeButton}>
                            <Text style={styles.retakeText}>📷 Retake Photo</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={captureSelfie} style={styles.captureButton}>
                        <Text style={styles.captureIcon}>📷</Text>
                        <Text style={styles.captureText}>Capture Selfie</Text>
                    </TouchableOpacity>
                )}
            </Card>

            {/* Tips Card */}
            <Card variant="outlined" style={{ padding: 16, backgroundColor: '#dbeafe', marginTop: 16 }}>
                <Text style={{ ...typography.label.sm, color: colors.textSecondary, marginBottom: 8 }}>
                    💡 Photo Tips
                </Text>
                <Text style={{ ...typography.body.xs, color: colors.textSecondary, lineHeight: 18 }}>
                    • Ensure good lighting{'\n'}
                    • Keep ID flat and fully visible{'\n'}
                    • Customer should look directly at camera{'\n'}
                    • Avoid shadows and glare
                </Text>
            </Card>
        </StepContainer>
    );
}

const styles = StyleSheet.create({
    photoCard: {
        padding: 20,
        marginBottom: 16,
    },
    photoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    photoTitle: {
        ...typography.heading.sm,
        color: colors.text,
    },
    checkBadge: {
        backgroundColor: colors.success,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    photoInstructions: {
        ...typography.body.sm,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    captureButton: {
        backgroundColor: colors.primaryLight,
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    captureText: {
        ...typography.label.md,
        color: colors.primary,
    },
    photoPreview: {
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
    },
    retakeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    retakeText: {
        ...typography.label.sm,
        color: colors.primary,
    },
});
