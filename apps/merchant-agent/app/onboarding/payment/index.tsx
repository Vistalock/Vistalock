import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { api } from '../../../lib/api';

export default function PaymentScreen() {
    const { id, amount, deviceId } = useLocalSearchParams<{ id: string, amount: string, deviceId: string }>();
    const router = useRouter();
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleConfirmPayment = async () => {
        setProcessing(true);
        try {
            await api.post('/payments/confirm-down-payment', {
                loanId: id,
                amount: Number(amount), // Assuming full amount paid
                reference: `POS-${Date.now()}` // Mock POS ref
            });
            setSuccess(true);
        } catch (error: any) {
            Alert.alert('Payment Failed', error.response?.data?.message || 'Could not verify payment.');
        } finally {
            setProcessing(false);
        }
    };

    const handleFinish = () => {
        // Reset stack to dashboard
        router.dismissAll();
        router.replace('/dashboard');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />

            {!success ? (
                <View className="flex-1 p-6 justify-between">
                    <View>
                        <View className="items-center mb-8 mt-10">
                            <View className="w-20 h-20 bg-blue-500/20 rounded-full items-center justify-center mb-4">
                                <Ionicons name="cash" size={40} color="#3b82f6" />
                            </View>
                            <Text className="text-white text-2xl font-bold text-center">Collect Down Payment</Text>
                            <Text className="text-gray-400 text-center mt-2">
                                Please collect the down payment from the customer to unlock the device.
                            </Text>
                        </View>

                        <View className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                            <Text className="text-gray-400 text-sm uppercase mb-1">Amount Due</Text>
                            <Text className="text-white text-4xl font-bold">₦{Number(amount).toLocaleString()}</Text>
                            <View className="h-px bg-slate-700 my-4" />
                            <View className="flex-row justify-between">
                                <Text className="text-gray-400">Loan ID</Text>
                                <Text className="text-white font-mono text-xs">{id?.slice(0, 8)}...</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleConfirmPayment}
                        disabled={processing}
                        className="bg-blue-600 p-4 rounded-xl items-center"
                    >
                        {processing ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Confirm Cash Receipt</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="flex-1 p-6 justify-center items-center">
                    <View className="w-24 h-24 bg-green-500/20 rounded-full items-center justify-center mb-6">
                        <Ionicons name="checkmark" size={50} color="#22c55e" />
                    </View>
                    <Text className="text-white text-3xl font-bold text-center mb-2">Payment Successful!</Text>
                    <Text className="text-gray-400 text-center mb-8">
                        The device has been successfully unlocked and activated.
                    </Text>

                    <View className="bg-slate-800 p-4 rounded-xl border border-green-500/30 w-full mb-8">
                        <View className="flex-row items-center space-x-3">
                            <Ionicons name="lock-open" size={24} color="#22c55e" />
                            <View>
                                <Text className="text-white font-bold">Device Unlocked</Text>
                                <Text className="text-green-400 text-xs">Policy Synced</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleFinish}
                        className="bg-green-600 p-4 rounded-xl w-full items-center"
                    >
                        <Text className="text-white font-bold text-lg">Return to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
