import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useOnboarding } from '../../context/OnboardingContext';
import DojahService from '../../lib/dojah';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { OfflineBanner } from '../../components/OfflineBanner';

export default function CustomerDetails() {
    const router = useRouter();
    const { updateCustomer, data, setNinVerification } = useOnboarding();
    const { isOnline, showOfflineWarning, dismissWarning } = useNetworkStatus();

    // Pre-fill if reviewing or coming back
    const [firstName, setFirstName] = useState(data.customer.firstName || '');
    const [lastName, setLastName] = useState(data.customer.lastName || '');
    const [address, setAddress] = useState(data.customer.address || '');
    const [nin, setNin] = useState(data.customer.nin || '');

    // NIN Verification state
    const [ninVerifying, setNinVerifying] = useState(false);
    const [ninVerified, setNinVerified] = useState(false);
    const [ninVerificationData, setNinVerificationData] = useState<{
        valid: boolean;
        firstName: string;
        lastName: string;
        dateOfBirth?: string;
        photoUrl?: string;
    } | null>(null);
    const [ninError, setNinError] = useState('');
    const [showBvnOption, setShowBvnOption] = useState(false);

    // Duplicate check state
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);

    const handleNinChange = (value: string) => {
        setNin(value);
        setNinVerified(false);
        setNinError('');
        setNinVerificationData(null);

        // Show verify button when 11 digits entered
        if (value.length === 11) {
            setShowBvnOption(false);
        }
    };

    const handleVerifyNIN = async () => {
        // Check internet connection first
        if (!isOnline) {
            Alert.alert(
                'No Internet Connection',
                'NIN verification requires internet. Your data has been saved and you can continue when connection is restored.',
                [{ text: 'OK' }]
            );
            return;
        }

        if (nin.length !== 11) {
            setNinError('NIN must be exactly 11 digits');
            return;
        }

        if (!data.customer.phoneNumber) {
            Alert.alert('Error', 'Phone number is required before NIN verification');
            return;
        }

        setNinVerifying(true);
        setNinError('');

        try {
            // Check for duplicate customer first
            setCheckingDuplicate(true);
            const duplicateCheck = await DojahService.checkDuplicateCustomer(nin, data.customer.phoneNumber);
            setCheckingDuplicate(false);

            if (duplicateCheck.isDuplicate) {
                Alert.alert(
                    'Duplicate Customer',
                    'This customer already exists in the system. Please check existing records.',
                    [{ text: 'OK' }]
                );
                setNinError('Customer already exists');
                setNinVerifying(false);
                return;
            }

            // Verify NIN with Dojah
            const userId = data.userId || 'temp-user-id'; // Will be created after phone verification
            const verificationResult = await DojahService.verifyNIN(userId, nin);

            if (verificationResult.valid) {
                setNinVerified(true);
                setNinVerificationData(verificationResult);
                setShowBvnOption(true);

                // Auto-populate names if they match
                if (!firstName) setFirstName(verificationResult.firstName);
                if (!lastName) setLastName(verificationResult.lastName);

                // Store verification result in context
                if (setNinVerification) {
                    setNinVerification({
                        verified: true,
                        dojahData: verificationResult,
                    });
                }

                Alert.alert('✅ NIN Verified', `Name: ${verificationResult.firstName} ${verificationResult.lastName}`);
            } else {
                setNinError('NIN verification failed');
                Alert.alert('Verification Failed', 'Could not verify NIN. Please check the number and try again.');
            }
        } catch (error: any) {
            console.error('NIN verification error:', error);
            setNinError(error?.message || 'Verification failed');
            Alert.alert('Error', error?.message || 'NIN verification failed. Please try again.');
        } finally {
            setNinVerifying(false);
        }
    };

    const handleContinue = () => {
        // Validate all required fields
        if (!firstName.trim() || !lastName.trim() || !address.trim()) {
            Alert.alert('Missing Details', 'Please fill in all required fields.');
            return;
        }

        // NIN is MANDATORY
        if (!nin || nin.length !== 11) {
            Alert.alert('NIN Required', 'Please enter a valid 11-digit NIN.');
            return;
        }

        // NIN must be verified
        if (!ninVerified) {
            Alert.alert('Verification Required', 'Please verify the NIN before continuing.');
            return;
        }

        // Check name mismatch
        if (ninVerificationData) {
            const firstNameMatch = firstName.toLowerCase().trim() === ninVerificationData.firstName.toLowerCase().trim();
            const lastNameMatch = lastName.toLowerCase().trim() === ninVerificationData.lastName.toLowerCase().trim();

            if (!firstNameMatch || !lastNameMatch) {
                Alert.alert(
                    'Name Mismatch',
                    `Entered name: ${firstName} ${lastName}\nNIN name: ${ninVerificationData.firstName} ${ninVerificationData.lastName}\n\nPlease use the name as it appears on the NIN.`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Use NIN Name',
                            onPress: () => {
                                setFirstName(ninVerificationData.firstName);
                                setLastName(ninVerificationData.lastName);
                            },
                        },
                    ]
                );
                return;
            }
        }

        // Save customer data
        updateCustomer({
            firstName,
            lastName,
            address,
            nin,
        });

        router.push('/sale/kyc-capture');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />
            <OfflineBanner visible={showOfflineWarning && !isOnline} onDismiss={dismissWarning} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    <Text style={{ ...typography.heading.lg, color: colors.text, marginBottom: 8 }}>
                        Customer Details
                    </Text>
                    <Text style={{ ...typography.body.md, color: colors.textSecondary, marginBottom: 32 }}>
                        Enter the customer's personal information.
                    </Text>

                    <Input
                        label="First Name"
                        placeholder="e.g. John"
                        value={firstName}
                        onChangeText={setFirstName}
                        containerStyle={{ marginBottom: 16 }}
                        autoCapitalize="words"
                    />

                    <Input
                        label="Last Name"
                        placeholder="e.g. Doe"
                        value={lastName}
                        onChangeText={setLastName}
                        containerStyle={{ marginBottom: 16 }}
                        autoCapitalize="words"
                    />

                    <Input
                        label="Residential Address"
                        placeholder="e.g. 123 Main Street, Lagos"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        numberOfLines={2}
                        containerStyle={{ marginBottom: 24 }}
                    />

                    {/* NIN Verification Section */}
                    <View style={{ marginBottom: 24, padding: 16, backgroundColor: ninVerified ? colors.primaryLight : '#fff', borderRadius: 12, borderWidth: 1, borderColor: ninVerified ? colors.primary : colors.border }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={{ ...typography.label.md, color: colors.text, flex: 1 }}>
                                National Identity Number (NIN) *
                            </Text>
                            {ninVerified && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                                    <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>✓ Verified</Text>
                                </View>
                            )}
                        </View>

                        <Input
                            placeholder="Enter 11-digit NIN"
                            value={nin}
                            onChangeText={handleNinChange}
                            keyboardType="number-pad"
                            maxLength={11}
                            containerStyle={{ marginBottom: 0 }}
                            error={ninError}
                            editable={!ninVerified}
                        />

                        {ninVerificationData && (
                            <View style={{ marginTop: 12, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
                                <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Verified Name:</Text>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                                    {ninVerificationData.firstName} {ninVerificationData.lastName}
                                </Text>
                                {ninVerificationData.dateOfBirth && (
                                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                                        DOB: {ninVerificationData.dateOfBirth}
                                    </Text>
                                )}
                            </View>
                        )}

                        {nin.length === 11 && !ninVerified && (
                            <View style={{ marginTop: 12 }}>
                                {checkingDuplicate ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
                                        <ActivityIndicator size="small" color={colors.primary} />
                                        <Text style={{ marginLeft: 8, color: colors.textSecondary }}>Checking for duplicates...</Text>
                                    </View>
                                ) : (
                                    <Button
                                        title={ninVerifying ? "Verifying..." : "Verify NIN"}
                                        onPress={handleVerifyNIN}
                                        loading={ninVerifying}
                                        variant="primary"
                                    />
                                )}
                            </View>
                        )}

                        <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 8 }}>
                            💡 NIN verification is mandatory for all customers
                        </Text>
                    </View>

                    {/* Optional BVN for better terms */}
                    {showBvnOption && ninVerified && (
                        <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#dbeafe', borderRadius: 12, borderWidth: 1, borderColor: '#3b82f6' }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                                ⭐ Want Better Loan Terms?
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 12 }}>
                                Add BVN verification to increase credit limit by up to 20%
                            </Text>
                            <Button
                                title="+ Add BVN Verification"
                                variant="outline"
                                onPress={() => Alert.alert('Coming Soon', 'BVN verification will be available in the next update.')}
                            />
                        </View>
                    )}

                    <Button
                        title="Continue to KYC"
                        onPress={handleContinue}
                        disabled={!ninVerified}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
