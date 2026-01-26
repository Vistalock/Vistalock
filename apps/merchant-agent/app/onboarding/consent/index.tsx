import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';

export default function ConsentScreen() {
    const router = useRouter();
    const { data } = useOnboarding();
    const { customer, selectedProduct, loanPlan } = data;

    const [agreed, setAgreed] = useState(false);
    const [signatureName, setSignatureName] = useState('');

    const handleContinue = () => {
        if (!agreed) {
            Alert.alert('Agreement Required', 'Please accept the terms and conditions.');
            return;
        }
        if (!signatureName.trim()) {
            Alert.alert('Signature Required', 'Please type your full name to sign.');
            return;
        }
        if (signatureName.trim().toLowerCase() !== `${customer.firstName} ${customer.lastName}`.toLowerCase()) {
            // Optional: Enforce name match
            // Alert.alert('Signature Mismatch', 'Signature must match the customer name.');
            // return;
        }

        // Logic to save consent state?
        // For MVP, we pass it to the final submission or store in context.
        // Actually, let's just proceed to Device Binding, and the signature 
        // will be "captured" here. We might need to add it to context if we want to send it later.
        // UPDATE: I should add signature to context.

        router.push('/onboarding/device');
    };

    if (!selectedProduct || !loanPlan) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

                <View className="p-4 border-b border-slate-800 flex-row justify-between items-center">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Loan Agreement</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView className="flex-1 p-4">
                    <Text className="text-gray-400 mb-4">
                        Please review the loan terms for the purchase of <Text className="text-white font-bold">{selectedProduct.name}</Text>.
                    </Text>

                    <View className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6">
                        <Text className="text-white font-bold text-lg mb-2">Loan Summary</Text>
                        <Text className="text-gray-400">Principal: ₦{(loanPlan.totalRepayment - loanPlan.totalRepayment + selectedProduct.price - loanPlan.downPayment).toLocaleString()}</Text>
                        <Text className="text-gray-400">Total Repayment: ₦{loanPlan.totalRepayment.toLocaleString()}</Text>
                        <Text className="text-gray-400">Tenure: {loanPlan.tenure} Months</Text>
                        <Text className="text-gray-400">Monthly: ₦{loanPlan.monthlyRepayment.toLocaleString()}</Text>
                    </View>

                    <View className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6 h-64">
                        <ScrollView nestedScrollEnabled>
                            <Text className="text-white font-bold mb-2">TERMS AND CONDITIONS</Text>
                            <Text className="text-gray-400 text-sm leading-5">
                                1. DEVICE LOCKING: I understand that the device {selectedProduct.name} will be locked if payment is not made by the due date.{'\n\n'}
                                2. OWNERSHIP: Ownership of the device remains with the Merchant until full payment is made.{'\n\n'}
                                3. DATA PRIVACY: I consent to the processing of my personal data for credit scoring and recovery purposes.{'\n\n'}
                                4. RECOVERY: In the event of default, the Merchant reserves the right to recover the device and/or pursue legal action.{'\n\n'}
                                5. WARRANTIES: Standard manufacturer warranty applies. Physical damage is not covered.{'\n\n'}
                                (Scroll to read more...)
                            </Text>
                        </ScrollView>
                    </View>

                    <View className="flex-row items-center mb-6">
                        <Switch
                            value={agreed}
                            onValueChange={setAgreed}
                            trackColor={{ false: '#334155', true: '#16a34a' }}
                            thumbColor={agreed ? '#ffffff' : '#94a3b8'}
                        />
                        <Text className="text-white ml-3 flex-1">
                            I, <Text className="font-bold">{customer.firstName} {customer.lastName}</Text>, have read and agree to the terms above.
                        </Text>
                    </View>

                    {agreed && (
                        <View className="mb-6">
                            <Text className="text-white font-bold mb-2">Digital Signature</Text>
                            <Text className="text-gray-500 text-xs mb-2">Type your full name to sign</Text>
                            <TextInput
                                className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 font-handwriting" // font-handwriting is placeholder for styling
                                placeholder="Type Full Name"
                                placeholderTextColor="#64748b"
                                value={signatureName}
                                onChangeText={setSignatureName}
                                autoCapitalize="words"
                            />
                        </View>
                    )}

                </ScrollView>

                <View className="p-4 bg-slate-900 border-t border-slate-800">
                    <TouchableOpacity
                        onPress={handleContinue}
                        className={`p-4 rounded-xl items-center ${agreed && signatureName ? 'bg-green-600' : 'bg-slate-700'}`}
                    >
                        <Text className="text-white font-bold text-lg">Accept & Continue</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
