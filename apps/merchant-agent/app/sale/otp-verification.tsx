import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StepContainer } from '../../components/StepContainer';
import { Button } from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';
import { validateOTP } from '../../lib/validation';
import AuditLogger from '../../lib/auditLogger';
import { api } from '../../lib/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const ONBOARDING_STEPS = [
    { id: 'phone', label: 'Phone', completed: true },
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

export default function OTPVerificationScreen() {
    const router = useRouter();
    const { data, setUserId } = useOnboarding();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        // Start countdown timer
        const timer = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleOtpChange = (value: string, index: number) => {
        // Only allow digits
        const digit = value.replace(/\D/g, '').slice(-1);

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (index === 5 && digit) {
            const fullOtp = newOtp.join('');
            if (fullOtp.length === 6) {
                handleVerifyOTP(fullOtp);
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = async (otpCode?: string) => {
        const otpValue = otpCode || otp.join('');

        // Validate OTP
        const validation = validateOTP(otpValue);
        if (!validation.valid) {
            Alert.alert('Invalid OTP', validation.error || 'Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);

        try {
            // Verify OTP with backend
            const response = await api.post('/auth/verify-otp', {
                phoneNumber: data.customer.phoneNumber,
                otp: otpValue,
            });

            const { userId, token } = response.data;

            // Save user ID and token
            setUserId(userId);
            // Store token for API calls
            await AsyncStorage.setItem('authToken', token);

            // Log action
            AuditLogger.log('OTP_VERIFIED', { phoneNumber: data.customer.phoneNumber }, userId);

            // Navigate to customer details
            router.push('/sale/customer-details');
        } catch (error: any) {
            console.error('OTP verification failed:', error);

            AuditLogger.logError('OTP_VERIFICATION_FAILED', error?.message || 'Unknown error', {
                phoneNumber: data.customer.phoneNumber,
            });

            Alert.alert(
                'Verification Failed',
                error.response?.data?.message || 'Invalid OTP code. Please try again.',
                [{ text: 'OK' }]
            );

            // Clear OTP inputs
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResending(true);

        try {
            await api.post('/auth/send-otp', {
                phoneNumber: data.customer.phoneNumber,
            });

            Alert.alert('OTP Sent', 'A new verification code has been sent to your phone.');

            // Reset timer
            setResendTimer(60);
            setCanResend(false);

            // Restart countdown
            const timer = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            AuditLogger.log('OTP_RESENT', { phoneNumber: data.customer.phoneNumber });
        } catch (error: any) {
            console.error('Failed to resend OTP:', error);
            Alert.alert('Error', 'Failed to resend OTP. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <StepContainer
            title="Enter Verification Code"
            subtitle={`Code sent to ${data.customer.phoneNumber}`}
            onContinue={() => handleVerifyOTP()}
            onBack={handleBack}
            continueLabel="Verify"
            continueDisabled={otp.join('').length !== 6}
            continueLoading={loading}
            showProgress
            steps={ONBOARDING_STEPS}
            currentStepId="otp"
            showBackButton
        >
            <View style={{ marginBottom: 32 }}>
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={[
                                styles.otpInput,
                                digit && styles.otpInputFilled,
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                            autoFocus={index === 0}
                        />
                    ))}
                </View>
            </View>

            <View style={{ marginBottom: 24 }}>
                <Button
                    title={canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                    onPress={handleResendOTP}
                    variant="outline"
                    disabled={!canResend}
                    loading={resending}
                />
            </View>

            <View style={{ padding: 16, backgroundColor: '#dbeafe', borderRadius: 12 }}>
                <Text style={{ ...typography.label.sm, color: colors.textSecondary, marginBottom: 4 }}>
                    💡 Didn't receive the code?
                </Text>
                <Text style={{ ...typography.body.xs, color: colors.textSecondary, lineHeight: 18 }}>
                    Check your messages or wait {resendTimer}s to request a new code. Make sure the phone number is correct.
                </Text>
            </View>
        </StepContainer>
    );
}

const styles = StyleSheet.create({
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    otpInput: {
        flex: 1,
        height: 56,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        backgroundColor: '#fff',
    },
    otpInputFilled: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
});
