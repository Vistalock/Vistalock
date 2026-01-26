import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../../context/OnboardingContext';
import { StatusBar } from 'expo-status-bar';
import { api } from '../../../lib/api';

export default function SummaryScreen() {
    const router = useRouter();
    const { data } = useOnboarding();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const formData = new FormData();

            // Append Data as JSON strings for complex objects
            formData.append('customer', JSON.stringify(data.customer));
            formData.append('device', JSON.stringify(data.device));
            if (data.loanPlan) {
                formData.append('loanPlan', JSON.stringify(data.loanPlan));
            }

            // Add Selected Product
            if (data.selectedProduct) {
                formData.append('productId', data.selectedProduct.id);
                // Also send product snapshot if needed, but ID is enough for backend lookup usually
            } else {
                Alert.alert('Error', 'No product selected');
                setSubmitting(false);
                return;
            }

            // Append Files
            if (data.kyc.idPhotoUri) {
                // @ts-ignore: React Native FormData expects this shape
                formData.append('idCard', {
                    uri: data.kyc.idPhotoUri,
                    name: 'id_card.jpg',
                    type: 'image/jpeg',
                });
            }
            if (data.kyc.selfieUri) {
                // @ts-ignore: React Native FormData expects this shape
                formData.append('selfie', {
                    uri: data.kyc.selfieUri,
                    name: 'selfie.jpg',
                    type: 'image/jpeg',
                });
            }

            const response = await api.post('/auth/agents/onboard', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Alert.alert('Success', 'Application Submitted Successfully!', [
                {
                    text: 'Collect Payment', onPress: () => {
                        if (response.data.loanId && data.loanPlan) {
                            router.dismissAll();
                            router.push({
                                pathname: '/onboarding/payment',
                                params: {
                                    id: response.data.loanId,
                                    amount: data.loanPlan.downPayment.toString(),
                                    deviceId: response.data.deviceId || 'unknown'
                                }
                            });
                        } else {
                            // Fallback if data missing
                            reset();
                            router.replace('/dashboard');
                        }
                    }
                }
            ]);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Submission Failed', error.response?.data?.message || 'Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />
            <ScrollView className="p-6">
                <Text className="text-white text-2xl font-bold mb-6">Review & Submit</Text>

                <View className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4">
                    <Text className="text-green-400 font-bold mb-2 uppercase text-xs">Customer</Text>
                    <Text className="text-white text-lg font-bold">{data.customer.firstName} {data.customer.lastName}</Text>
                    <Text className="text-gray-400">{data.customer.phoneNumber}</Text>
                    <Text className="text-gray-400 text-sm mt-1">{data.customer.address}</Text>
                </View>

                <View className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4">
                    <Text className="text-blue-400 font-bold mb-2 uppercase text-xs">Product & Plan</Text>
                    <Text className="text-white text-lg font-bold">{data.selectedProduct?.name}</Text>
                    <Text className="text-gray-400">Price: ₦{data.selectedProduct?.price.toLocaleString()}</Text>

                    {data.loanPlan && (
                        <View className="mt-3 bg-slate-900 p-3 rounded-lg">
                            <View className="flex-row justify-between mb-1">
                                <Text className="text-gray-400 text-xs">Down Payment</Text>
                                <Text className="text-green-400 font-bold text-xs">₦{data.loanPlan.downPayment.toLocaleString()}</Text>
                            </View>
                            <View className="flex-row justify-between mb-1">
                                <Text className="text-gray-400 text-xs">Monthly</Text>
                                <Text className="text-white font-bold text-xs">₦{data.loanPlan.monthlyRepayment.toLocaleString()} x {data.loanPlan.tenure}mo</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-400 text-xs">Total</Text>
                                <Text className="text-white font-bold text-xs">₦{data.loanPlan.totalRepayment.toLocaleString()}</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4">
                    <Text className="text-gray-400 font-bold mb-2 uppercase text-xs">Device to Bind</Text>
                    <Text className="text-white text-lg font-bold">{data.device.model || 'Unknown Model'}</Text>
                    <Text className="text-gray-400">IMEI: {data.device.imei}</Text>
                </View>

                <View className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-8">
                    <Text className="text-yellow-400 font-bold mb-3 uppercase text-xs">KYC Documents</Text>
                    <View className="flex-row gap-4">
                        <View>
                            <Image source={{ uri: data.kyc.idPhotoUri }} className="w-24 h-24 rounded-lg bg-black" />
                            <Text className="text-white text-center text-xs mt-1">ID Card</Text>
                        </View>
                        <View>
                            <Image source={{ uri: data.kyc.selfieUri }} className="w-24 h-24 rounded-lg bg-black" />
                            <Text className="text-white text-center text-xs mt-1">Selfie</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    className={`bg-green-600 p-4 rounded-xl items-center mb-8 ${submitting ? 'opacity-50' : ''}`}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Submit Application</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
