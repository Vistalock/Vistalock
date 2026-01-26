import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useOnboarding } from '../../context/OnboardingContext';
import { api } from '../../lib/api';

export default function CustomerInfoScreen() {
    const router = useRouter();
    const { data, updateCustomer } = useOnboarding();
    const [form, setForm] = useState(data.customer);

    // OTP State
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        if (!form.firstName || !form.lastName || !form.phoneNumber) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }
        if (!isPhoneVerified) {
            Alert.alert('Verification Required', 'Please verify the customer phone number first.');
            return;
        }
        updateCustomer(form);
        router.push('/onboarding/kyc');
    };

    const requestOtp = async () => {
        if (!form.phoneNumber || form.phoneNumber.length < 10) {
            Alert.alert('Invalid Number', 'Please enter a valid phone number.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/onboarding/verify-phone', {
                phoneNumber: form.phoneNumber
            });
            setShowOtpModal(true);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter the 6-digit code.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/onboarding/validate-otp', {
                phoneNumber: form.phoneNumber,
                otp
            });
            setIsPhoneVerified(true);
            setShowOtpModal(false);
            Alert.alert('Success', 'Phone number verified!');
        } catch (error: any) {
            Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />

            {/* Header */}
            <View className="px-6 py-4 border-b border-slate-800">
                <Text className="text-white text-xl font-bold">Step 1: Customer Info</Text>
                <Text className="text-gray-400 text-sm">Enter the customer's personal details.</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-6">
                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-400 mb-2">First Name</Text>
                        <TextInput
                            className="bg-slate-800 text-white p-4 rounded-lg border border-slate-700"
                            placeholder="John"
                            placeholderTextColor="#64748b"
                            value={form.firstName}
                            onChangeText={t => setForm(prev => ({ ...prev, firstName: t }))}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 mb-2">Last Name</Text>
                        <TextInput
                            className="bg-slate-800 text-white p-4 rounded-lg border border-slate-700"
                            placeholder="Doe"
                            placeholderTextColor="#64748b"
                            value={form.lastName}
                            onChangeText={t => setForm(prev => ({ ...prev, lastName: t }))}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 mb-2">Phone Number</Text>
                        <View className="flex-row space-x-2">
                            <TextInput
                                className="bg-slate-800 text-white p-4 rounded-lg border border-slate-700 flex-1"
                                placeholder="08012345678"
                                placeholderTextColor="#64748b"
                                keyboardType="phone-pad"
                                value={form.phoneNumber}
                                onChangeText={t => {
                                    setForm(prev => ({ ...prev, phoneNumber: t }));
                                    setIsPhoneVerified(false); // Reset verification on change
                                }}
                            />
                            {isPhoneVerified ? (
                                <View className="bg-green-600/20 p-4 rounded-lg items-center justify-center border border-green-600">
                                    <Text className="text-green-400 font-bold">✓</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    className="bg-blue-600 p-4 rounded-lg items-center justify-center"
                                    onPress={requestOtp}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold">Verify</Text>}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View>
                        <Text className="text-gray-400 mb-2">Residential Address</Text>
                        <TextInput
                            className="bg-slate-800 text-white p-4 rounded-lg border border-slate-700"
                            placeholder="123 Lagos Street..."
                            placeholderTextColor="#64748b"
                            multiline
                            numberOfLines={3}
                            value={form.address}
                            onChangeText={t => setForm(prev => ({ ...prev, address: t }))}
                        />
                    </View>
                </View>
            </ScrollView>

            <View className="p-6 border-t border-slate-800">
                <TouchableOpacity
                    onPress={handleNext}
                    className={`p-4 rounded-xl items-center ${isPhoneVerified ? 'bg-green-600' : 'bg-slate-700'}`}
                    disabled={!isPhoneVerified}
                >
                    <Text className={`font-bold text-lg ${isPhoneVerified ? 'text-white' : 'text-slate-400'}`}>
                        {isPhoneVerified ? 'Next: KYC Capture' : 'Verify Phone to Continue'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* OTP Modal */}
            <Modal visible={showOtpModal} transparent animationType="slide">
                <View className="flex-1 bg-black/80 justify-center items-center px-6">
                    <View className="bg-slate-900 w-full p-6 rounded-2xl border border-slate-700">
                        <Text className="text-white text-xl font-bold mb-2">Enter Verification Code</Text>
                        <Text className="text-gray-400 mb-6">We sent a code to {form.phoneNumber}</Text>

                        <TextInput
                            className="bg-slate-800 text-white p-4 rounded-lg border border-slate-700 text-center text-3xl tracking-widest font-bold mb-6"
                            placeholder="000000"
                            placeholderTextColor="#64748b"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                            autoFocus
                        />

                        <TouchableOpacity
                            className="bg-green-600 p-4 rounded-xl items-center mb-4"
                            onPress={verifyOtp}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Verify Code</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="p-4 items-center"
                            onPress={() => setShowOtpModal(false)}
                        >
                            <Text className="text-gray-400">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
