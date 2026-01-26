import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { api } from '../lib/api';

export default function ActivateScreen() {
    const router = useRouter();
    const { token } = useLocalSearchParams();
    const [deviceId, setDeviceId] = useState('');

    // Form State
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getDeviceId();
    }, []);

    const getDeviceId = async () => {
        let id = 'unknown-device';
        if (Platform.OS === 'android') {
            id = Application.getAndroidId();
        } else if (Platform.OS === 'ios') {
            const iosId = await Application.getIosIdForVendorAsync();
            id = iosId || 'ios-mock-id';
        }
        console.log('Device ID:', id);
        setDeviceId(id);
    };

    const handleActivate = async () => {
        if (!password || !confirmPassword || !otp) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        // Defensive token handling
        const tokenStr = typeof token === 'string' ? token : (Array.isArray(token) ? token[0] : '');

        if (!tokenStr) {
            Alert.alert('Error', 'Invalid Activation Token. Please re-open the link.');
            return;
        }

        setLoading(true);
        try {
            console.log('Activating...', { token: tokenStr, deviceId });
            await api.post('/auth/agent/activate', {
                token: tokenStr,
                otp,
                password,
                deviceId
            });

            Alert.alert('Success', 'Device Activated! Please login.', [
                { text: 'OK', onPress: () => router.replace('/') }
            ]);
        } catch (error: any) {
            console.error('Activation Failed:', error.response?.data || error.message);
            Alert.alert('Activation Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center' }}>
            <StatusBar style="light" />
            <View className="px-6">
                <View className="mb-8">
                    <Text className="text-3xl font-bold text-white mb-2">Activate Device</Text>
                    <Text className="text-gray-400">Set up your account to start selling.</Text>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-400 mb-2">One-Time Password (OTP)</Text>
                        <TextInput
                            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-center text-xl tracking-widest font-bold"
                            placeholder="123456"
                            placeholderTextColor="#64748b"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                        />
                        <Text className="text-xs text-gray-500 mt-1">Found in your invite email/SMS</Text>
                    </View>

                    <View>
                        <Text className="text-gray-400 mb-2">New Password</Text>
                        <TextInput
                            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700"
                            placeholder="••••••••"
                            placeholderTextColor="#64748b"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 mb-2">Confirm Password</Text>
                        <TextInput
                            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700"
                            placeholder="••••••••"
                            placeholderTextColor="#64748b"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    <View className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/50 mt-4">
                        <Text className="text-blue-400 text-xs">
                            📱 This device ({deviceId.slice(0, 8)}...) will be bound to your account.
                        </Text>
                    </View>

                    <TouchableOpacity
                        className={`bg-green-600 p-4 rounded-xl items-center mt-6 ${loading ? 'opacity-50' : ''}`}
                        onPress={handleActivate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Activate & Bind</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="p-4 items-center"
                        onPress={() => router.replace('/')}
                    >
                        <Text className="text-gray-400">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
