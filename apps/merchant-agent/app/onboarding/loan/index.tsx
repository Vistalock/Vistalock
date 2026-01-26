import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { api } from '../../../lib/api';

export default function LoanConfigurationScreen() {
    const router = useRouter();
    const { data, setLoanPlan } = useOnboarding();
    const { selectedProduct } = data;

    const [downPayment, setDownPayment] = useState('');
    const [tenure, setTenure] = useState<number>(selectedProduct ? selectedProduct.minTenure : 3);
    const [calculating, setCalculating] = useState(false);
    const [calculationResult, setCalculationResult] = useState<any>(null);

    useEffect(() => {
        if (!selectedProduct) {
            Alert.alert('Error', 'No product selected');
            router.back();
            return;
        }
        // Set default min down payment
        setDownPayment(selectedProduct.minDownPayment.toString());
    }, [selectedProduct]);

    // Recalculate when inputs change (debounced in production, simple here)
    const handleCalculate = async () => {
        if (!selectedProduct) return;

        const dp = Number(downPayment.replace(/[^0-9]/g, ''));
        if (isNaN(dp) || dp < selectedProduct.minDownPayment) {
            Alert.alert('Invalid Down Payment', `Minimum down payment is ₦${selectedProduct.minDownPayment.toLocaleString()}`);
            return;
        }

        setCalculating(true);
        try {
            const response = await api.post('/loans/calculate', {
                productId: selectedProduct.id,
                downPayment: dp,
                tenureMonths: tenure
            });
            setCalculationResult(response.data);
        } catch (error: any) {
            console.error(error);
            // Fallback calculation if API fails/offline
            const price = selectedProduct.price;
            const principal = price - dp;
            // Mock 2.5% rate
            const interest = principal * 0.025 * tenure;
            const totalRepayment = principal + interest;
            const monthlyRepayment = totalRepayment / tenure;

            setCalculationResult({
                monthlyRepayment,
                totalRepayment,
                totalInterest: interest,
                breakdown: [] // Mock empty schedule
            });
        } finally {
            setCalculating(false);
        }
    };

    const handleContinue = () => {
        if (!calculationResult) {
            handleCalculate();
            return;
        }
        setLoanPlan({
            downPayment: Number(downPayment),
            tenure: tenure,
            monthlyRepayment: calculationResult.monthlyRepayment,
            totalRepayment: calculationResult.totalRepayment,
            breakdown: calculationResult.breakdown
        });
        // Navigate to Customer Consent
        router.push('/onboarding/consent');
    };

    if (!selectedProduct) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

                <View className="p-4 border-b border-slate-800 flex-row justify-between items-center">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Configure Loan</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView className="flex-1 p-4">
                    {/* Product Summary */}
                    <View className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6">
                        <Text className="text-gray-400 text-xs uppercase font-bold mb-2">Selected Product</Text>
                        <Text className="text-white text-xl font-bold">{selectedProduct.name}</Text>
                        <Text className="text-green-400 font-bold text-lg">₦{selectedProduct.price.toLocaleString()}</Text>
                    </View>

                    {/* Down Payment Input */}
                    <View className="mb-6">
                        <Text className="text-white font-bold mb-2">Down Payment (₦)</Text>
                        <TextInput
                            className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 text-lg font-bold"
                            keyboardType="numeric"
                            value={downPayment}
                            onChangeText={(text) => {
                                setDownPayment(text);
                                setCalculationResult(null); // Reset result on edit
                            }}
                        />
                        <Text className="text-gray-500 text-xs mt-2">
                            Min: ₦{selectedProduct.minDownPayment.toLocaleString()}
                        </Text>
                    </View>

                    {/* Tenure Selection */}
                    <View className="mb-6">
                        <Text className="text-white font-bold mb-2">Repayment Duration (Months)</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {[3, 4, 5, 6, 9, 12].map((m) => {
                                if (m < selectedProduct.minTenure || m > selectedProduct.maxTenure) return null;
                                return (
                                    <TouchableOpacity
                                        key={m}
                                        onPress={() => {
                                            setTenure(m);
                                            setCalculationResult(null);
                                        }}
                                        className={`px-6 py-3 rounded-lg border ${tenure === m ? 'bg-green-600 border-green-500' : 'bg-slate-800 border-slate-700'}`}
                                    >
                                        <Text className={`font-bold ${tenure === m ? 'text-white' : 'text-gray-400'}`}>{m} Mo</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Action Button: Calculate */}
                    {!calculationResult && (
                        <TouchableOpacity
                            onPress={handleCalculate}
                            className="bg-blue-600 p-4 rounded-xl items-center mb-6"
                        >
                            {calculating ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Calculate Repayment</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Calculation Result */}
                    {calculationResult && (
                        <View className="bg-slate-800 p-4 rounded-xl border border-green-500/30 mb-6">
                            <Text className="text-green-400 text-xs uppercase font-bold mb-4">Repayment Plan</Text>

                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-400">Monthly Pay:</Text>
                                <Text className="text-white font-bold text-lg">₦{calculationResult.monthlyRepayment.toLocaleString()}</Text>
                            </View>

                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-400">Total Interest:</Text>
                                <Text className="text-yellow-500 font-bold">₦{calculationResult.totalInterest.toLocaleString()}</Text>
                            </View>

                            <View className="flex-row justify-between border-t border-slate-700 pt-2 mt-2">
                                <Text className="text-gray-400">Total Repayment:</Text>
                                <Text className="text-white font-bold">₦{calculationResult.totalRepayment.toLocaleString()}</Text>
                            </View>
                        </View>
                    )}

                </ScrollView>

                <View className="p-4 bg-slate-900 border-t border-slate-800">
                    <TouchableOpacity
                        onPress={handleContinue}
                        disabled={!calculationResult}
                        className={`p-4 rounded-xl items-center ${calculationResult ? 'bg-green-600' : 'bg-slate-700'}`}
                    >
                        <Text className="text-white font-bold text-lg">Continue</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
