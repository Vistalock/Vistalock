import React, { useState, useRef } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import SignatureCanvas from 'react-native-signature-canvas';
import { StepContainer } from '../../components/StepContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useOnboarding } from '../../context/OnboardingContext';
import { validateName } from '../../lib/validation';
import AuditLogger from '../../lib/auditLogger';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const ONBOARDING_STEPS = [
    { id: 'phone', label: 'Phone', completed: true },
    { id: 'otp', label: 'OTP', completed: true },
    { id: 'customer', label: 'Details', completed: true },
    { id: 'kyc', label: 'KYC', completed: true },
    { id: 'credit', label: 'Credit', completed: true },
    { id: 'device', label: 'Device', completed: true },
    { id: 'imei', label: 'IMEI', completed: true },
    { id: 'terms', label: 'Terms', completed: true },
    { id: 'consent', label: 'Consent', completed: false },
    { id: 'release', label: 'Release', completed: false },
];

const CONSENT_TEXT = `
I hereby acknowledge and agree to the following terms and conditions:

1. LOAN AGREEMENT: I agree to purchase the selected device through a Buy Now Pay Later (BNPL) loan arrangement with Vistalock.

2. PAYMENT TERMS: I understand and accept the loan terms including the down payment, monthly repayment amount, tenure, and interest rate as displayed.

3. DEVICE LOCK POLICY: I acknowledge that the Vistalock Device Agent will be installed on the device and may remotely lock the device if I miss any scheduled payment.

4. PAYMENT RESPONSIBILITY: I commit to making all monthly payments on time. Late payments may result in device locking and additional fees.

5. DEVICE OWNERSHIP: I understand that full ownership of the device transfers to me only after all payments are completed.

6. IDENTITY VERIFICATION: I confirm that all information provided (NIN, photos, personal details) is accurate and belongs to me.

7. TAMPER PREVENTION: I agree not to uninstall the Device Agent, factory reset the device, or attempt to bypass the lock mechanism.

8. DATA COLLECTION: I consent to Vistalock collecting and processing my data for loan management and credit assessment purposes.

By signing below, I confirm that I have read, understood, and agree to all the terms and conditions stated above.
`;

export default function ConsentScreen() {
    const router = useRouter();
    const { updateConsent, data } = useOnboarding();
    const signatureRef = useRef<any>(null);

    const [signatureName, setSignatureName] = useState(data.customer.firstName + ' ' + data.customer.lastName);
    const [signatureData, setSignatureData] = useState('');
    const [agreed, setAgreed] = useState(false);

    const handleSignature = (signature: string) => {
        setSignatureData(signature);
        setAgreed(true);
    };

    const handleClearSignature = () => {
        signatureRef.current?.clearSignature();
        setSignatureData('');
        setAgreed(false);
    };

    const handleContinue = () => {
        // Validate name
        const nameValidation = validateName(signatureName, 'Signature name');
        if (!nameValidation.valid) {
            Alert.alert('Invalid Name', nameValidation.error);
            return;
        }

        // Check signature
        if (!signatureData || !agreed) {
            Alert.alert('Signature Required', 'Please sign the consent form to continue.');
            return;
        }

        // Save consent
        updateConsent({
            agreed: true,
            signatureName,
            signatureData,
            timestamp: Date.now(),
        });

        AuditLogger.logConsentSigned(signatureName, data.userId);

        // Navigate to device release
        router.push('/sale/device-release');
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <StepContainer
            title="Customer Consent"
            subtitle="Review and sign the agreement"
            onContinue={handleContinue}
            onBack={handleBack}
            continueLabel="Continue to Device Release"
            continueDisabled={!agreed || !signatureData}
            showProgress
            steps={ONBOARDING_STEPS}
            currentStepId="consent"
            showBackButton
        >
            {/* Consent Text */}
            <Card variant="outlined" style={styles.consentCard}>
                <Text style={styles.consentTitle}>Loan Agreement & Terms</Text>
                <ScrollView style={styles.consentScroll} nestedScrollEnabled>
                    <Text style={styles.consentText}>{CONSENT_TEXT}</Text>
                </ScrollView>
            </Card>

            {/* Signature Name */}
            <View style={{ marginTop: 16, marginBottom: 16 }}>
                <Input
                    label="Full Name (as per NIN)"
                    placeholder="Enter full name"
                    value={signatureName}
                    onChangeText={setSignatureName}
                />
            </View>

            {/* Signature Canvas */}
            <Card variant="outlined" style={styles.signatureCard}>
                <Text style={styles.signatureTitle}>Customer Signature</Text>
                <Text style={styles.signatureSubtitle}>
                    Ask the customer to sign below
                </Text>

                <View style={styles.signatureCanvasContainer}>
                    <SignatureCanvas
                        ref={signatureRef}
                        onOK={handleSignature}
                        onEmpty={() => setAgreed(false)}
                        descriptionText=""
                        clearText="Clear"
                        confirmText="Save"
                        webStyle={`
              .m-signature-pad {
                box-shadow: none;
                border: 2px dashed ${colors.border};
                border-radius: 8px;
              }
              .m-signature-pad--body {
                border: none;
              }
              .m-signature-pad--footer {
                display: none;
              }
            `}
                    />
                </View>

                <View style={styles.signatureActions}>
                    <Button
                        title="Clear Signature"
                        onPress={handleClearSignature}
                        variant="outline"
                    />
                </View>

                {agreed && signatureData && (
                    <View style={styles.signatureConfirmation}>
                        <Text style={styles.signatureConfirmationText}>
                            ✓ Signature captured
                        </Text>
                    </View>
                )}
            </Card>

            {/* Info Card */}
            <Card variant="outlined" style={{ padding: 16, backgroundColor: '#dbeafe', marginTop: 16 }}>
                <Text style={{ ...typography.label.sm, color: colors.textSecondary, marginBottom: 4 }}>
                    💡 Legal Consent
                </Text>
                <Text style={{ ...typography.body.xs, color: colors.textSecondary, lineHeight: 18 }}>
                    This signature confirms that the customer has read, understood, and agreed to all loan terms and conditions.
                    It is legally binding.
                </Text>
            </Card>
        </StepContainer>
    );
}

const styles = StyleSheet.create({
    consentCard: {
        padding: 20,
    },
    consentTitle: {
        ...typography.heading.sm,
        color: colors.text,
        marginBottom: 12,
    },
    consentScroll: {
        maxHeight: 200,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
    },
    consentText: {
        ...typography.body.xs,
        color: colors.text,
        lineHeight: 20,
    },
    signatureCard: {
        padding: 20,
    },
    signatureTitle: {
        ...typography.heading.sm,
        color: colors.text,
        marginBottom: 4,
    },
    signatureSubtitle: {
        ...typography.body.sm,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    signatureCanvasContainer: {
        height: 200,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12,
    },
    signatureActions: {
        marginBottom: 12,
    },
    signatureConfirmation: {
        backgroundColor: '#f0fdf4',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    signatureConfirmationText: {
        ...typography.label.sm,
        color: colors.success,
        fontWeight: '700',
    },
});
