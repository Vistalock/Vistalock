import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Smartphone } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useSaleContext } from './SaleContext';

export default function Step1ProductSelection() {
    const router = useRouter();
    const { setProduct } = useSaleContext();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const res = await api.get('/products/agent-catalog');
                setProducts(res.data);
            } catch (error) {
                console.error('Failed to load catalog', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCatalog();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Select Product</Text>
                <Text style={styles.subtitle}>Choose the device the customer wants to finance.</Text>
            </View>

            {
                loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#16A34A" />
                    </View>
                ) : (
                    <View style={styles.productList}>
                        {products.map((product) => (
                            <TouchableOpacity
                                key={product.id}
                                style={styles.productCard}
                                onPress={() => {
                                    setProduct({
                                        id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        minDownPayment: product.minDownPayment,
                                        minTenure: product.minTenure,
                                        maxTenure: product.maxTenure,
                                        interestRate: product.interestRate,
                                    });
                                    router.push('/sale/step2-scan' as any);
                                }}
                            >
                                <View style={styles.iconContainer}>
                                    <Smartphone size={24} color="#0F172A" />
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <Text style={styles.productPrice}>₦{Number(product.price).toLocaleString()}</Text>
                                    <Text style={styles.productDeposit}>Min. Deposit: ₦{Number(product.minDownPayment).toLocaleString()}</Text>
                                    <Text style={styles.productDeposit}>Tenure: {product.minTenure} - {product.maxTenure} mo</Text>
                                </View>
                                <ChevronRight size={24} color="#CBD5E1" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )
            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { padding: 24, paddingBottom: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#64748B' },
    productList: { paddingHorizontal: 24, paddingBottom: 40 },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    productInfo: { flex: 1 },
    productName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
    productPrice: { fontSize: 15, color: '#16A34A', fontWeight: '600', marginBottom: 2 },
    productDeposit: { fontSize: 13, color: '#64748B' },
});
