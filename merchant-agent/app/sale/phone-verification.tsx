import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StepContainer } from '../../components/StepContainer';
import { Input } from '../../components/ui/Input';
import { useOnboarding } from '../../context/OnboardingContext';
import { validatePhoneNumber, formatPhoneNumber } from '../../lib/validation';
import AuditLogger from '../../lib/auditLogger';
import { api } from '../../lib/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const ONBOARDING_STEPS = [
    { id: 'phone', label: 'Phone', completed: false },
    { id: 'otp', label: 'OTP', completed: false },
    { id: 'customer', label: 'Details', completed: false },
    { id: 'kyc', label: 'KYC', completed: false },
    { id: 'credit', label: 'Credit', completed: false },
    { id: 'device', label: 'Device', completed: false },
    { id: 'imei', label: 'IMEI', completed: false },
    { id: 'terms', label: 'Terms', completed: false },
    { id: 'consent', label: 'Consent', completed: false },
    { id: 'release', label: 'Release', completed: false },
];

export default function PhoneVerificationScreen() {
    const router = useRouter();
    const { updateCustomer, data } = useOnboarding();

    const [phoneNumber, setPhoneNumber] = useState(data.customer.phoneNumber || '');
    const [phoneError, setPhoneError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePhoneChange = (value: string) => {
        // Remove all non-digits
        const cleaned = value.replace(/\D/g, '');

        // Limit to 11 digits
        const limited = cleaned.slice(0, 11);

        setPhoneNumber(limited);
        setPhoneError('');
    };

    const handleContinue = async () => {
        // Validate phone number
        const validation = validatePhoneNumber(phoneNumber);

        if (!validation.valid) {
            setPhoneError(validation.error || 'Invalid phone number');
            return;
        }

        setLoading(true);

        try {
            // Send OTP to phone number
            const response = await api.post('/auth/send-otp', {
                phoneNumber,
            });

            // Log action
            AuditLogger.log('PHONE_VERIFICATION_STARTED', { phoneNumber: formatPhoneNumber(phoneNumber) });

            // Save phone number to context
            updateCustomer({ phoneNumber });

            // Navigate to OTP screen
            router.push('/sale/otp-verification');
        } catch (error: any) {
            console.error('Failed to send OTP:', error);

            AuditLogger.logError('PHONE_VERIFICATION_FAILED', error?.message || 'Unknown error', {
                phoneNumber: formatPhoneNumber(phoneNumber),
            });

            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to send OTP. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <StepContainer
            title="Phone Verification"
            subtitle="Enter customer's phone number to begin"
            onContinue={handleContinue}
            continueLabel="Send OTP"
            continueDisabled={phoneNumber.length < 10}
            continueLoading={loading}
            showProgress
            steps={ONBOARDING_STEPS}
            currentStepId="phone"
        >
            <View style={{ marginBottom: 24 }}>
                <Input
                    label="Phone Number"
                    placeholder="08012345678"
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    maxLength={11}
                    error={phoneError}
                    autoFocus
                />

                {phoneNumber.length === 11 && !phoneError && (
                    <View style={{ marginTop: 12, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
                        <Text style={{ fontSize: 12, color: colors.success, fontWeight: '600' }}>
                            ✓ {formatPhoneNumber(phoneNumber)}
                        </Text>
                    </View>
                )}
            </View>

            <View style={{ padding: 16, backgroundColor: '#dbeafe', borderRadius: 12 }}>
                <Text style={{ ...typography.label.sm, color: colors.textSecondary, marginBottom: 4 }}>
                    💡 What happens next?
                </Text>
                <Text style={{ ...typography.body.xs, color: colors.textSecondary, lineHeight: 18 }}>
                    We'll send a 6-digit verification code to this number via SMS. The customer will need to provide this code to continue.
                </Text>
            </View>
        </StepContainer>
    );
}
