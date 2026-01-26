import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useOnboarding } from '../../../context/OnboardingContext';

type Product = {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    stockQuantity: number;
    minDownPayment: string; // JSON decimal comes as string
    minTenure: number;
    maxTenure: number;
};

export default function ProductSelectionScreen() {
    const router = useRouter();
    const { selectProduct } = useOnboarding();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/agent-catalog');
            setProducts(response.data);
        } catch (error) {
            console.error(error);
            // Mock data for dev if API fails (e.g. server restart needed)
            // Alert.alert('Error', 'Failed to fetch products');
            setProducts([
                { id: '1', name: 'Samsung Galaxy A15', price: 250000, currency: 'NGN', stockQuantity: 10, minDownPayment: '50000', minTenure: 3, maxTenure: 6, description: '4GB RAM / 64GB Storage' },
                { id: '2', name: 'Infinix Hot 40', price: 180000, currency: 'NGN', stockQuantity: 5, minDownPayment: '30000', minTenure: 3, maxTenure: 12, description: 'Budget friendly gaming' },
                { id: '3', name: 'Tecno Spark 20', price: 210000, currency: 'NGN', stockQuantity: 0, minDownPayment: '40000', minTenure: 3, maxTenure: 9, description: 'Great camera' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (product: Product) => {
        if (product.stockQuantity <= 0) return;
        setSelectedId(product.id);
    };

    const handleContinue = () => {
        if (!selectedId) return;
        const product = products.find(p => p.id === selectedId);
        if (product) {
            selectProduct({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                minDownPayment: Number(product.minDownPayment),
                minTenure: product.minTenure,
                maxTenure: product.maxTenure
            });
            router.push('/onboarding/loan');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />
            <View className="p-4 border-b border-slate-800 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Select Product</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#22c55e" />
                </View>
            ) : (
                <ScrollView className="flex-1 p-4">
                    <Text className="text-gray-400 mb-4">Choose a device for the customer.</Text>

                    <View className="gap-4 pb-20">
                        {products.map(product => (
                            <TouchableOpacity
                                key={product.id}
                                onPress={() => handleSelect(product)}
                                className={`p-4 rounded-xl border-2 ${selectedId === product.id ? 'border-green-500 bg-slate-800' : 'border-slate-700 bg-slate-900'} ${product.stockQuantity <= 0 ? 'opacity-50' : ''}`}
                                disabled={product.stockQuantity <= 0}
                            >
                                <View className="flex-row justify-between items-start mb-2">
                                    <View>
                                        <Text className="text-white font-bold text-lg">{product.name}</Text>
                                        <Text className="text-gray-400 text-sm">{product.description}</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-green-400 font-bold text-lg">
                                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(product.price)}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row gap-2 mt-2">
                                    <View className="bg-slate-700 px-2 py-1 rounded">
                                        <Text className="text-xs text-gray-300">Min Down: ₦{Number(product.minDownPayment).toLocaleString()}</Text>
                                    </View>
                                    <View className="bg-slate-700 px-2 py-1 rounded">
                                        <Text className="text-xs text-gray-300">Tenure: {product.minTenure}-{product.maxTenure} mo</Text>
                                    </View>
                                </View>

                                {product.stockQuantity <= 0 && (
                                    <Text className="text-red-500 text-xs font-bold mt-2">OUT OF STOCK</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            )}

            <View className="p-4 bg-slate-900 border-t border-slate-800">
                <TouchableOpacity
                    onPress={handleContinue}
                    disabled={!selectedId}
                    className={`p-4 rounded-xl items-center ${selectedId ? 'bg-green-600' : 'bg-slate-700'}`}
                >
                    <Text className="text-white font-bold text-lg">Continue to Device Scan</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
