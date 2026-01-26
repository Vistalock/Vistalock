import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StepContainer } from '../../components/StepContainer';
import { Card } from '../../components/ui/Card';
import { useOnboarding } from '../../context/OnboardingContext';
import { formatAmount } from '../../lib/validation';
import AuditLogger from '../../lib/auditLogger';
import { api } from '../../lib/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const ONBOARDING_STEPS = [
    { id: 'phone', label: 'Phone', completed: true },
    { id: 'otp', label: 'OTP', completed: true },
    { id: 'customer', label: 'Details', completed: true },
    { id: 'kyc', label: 'KYC', completed: true },
    { id: 'credit', label: 'Credit', completed: true },
    { id: 'device', label: 'Device', completed: false },
    { id: 'imei', label: 'IMEI', completed: false },
    { id: 'terms', label: 'Terms', completed: false },
    { id: 'consent', label: 'Consent', completed: false },
    { id: 'release', label: 'Release', completed: false },
];

interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    imageUrl?: string;
    specifications?: string;
    inStock: boolean;
}

export default function DeviceSelectionScreen() {
    const router = useRouter();
    const { selectProduct, data } = useOnboarding();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState(data.selectedProduct?.id || '');

    const maxLoanAmount = data.creditScore?.maxLoanAmount || 1000000;

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Failed to load products:', error);
            Alert.alert('Error', 'Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProduct = (product: Product) => {
        // Check if product price exceeds max loan amount
        if (product.price > maxLoanAmount) {
            Alert.alert(
                'Price Exceeds Limit',
                `This device costs ${formatAmount(product.price)}, which exceeds the customer's maximum loan amount of ${formatAmount(maxLoanAmount)}.`,
                [{ text: 'OK' }]
            );
            return;
        }

        setSelectedProductId(product.id);
    };

    const handleContinue = () => {
        const selectedProduct = products.find(p => p.id === selectedProductId);

        if (!selectedProduct) {
            Alert.alert('No Device Selected', 'Please select a device to continue.');
            return;
        }

        // Save selected product
        selectProduct({
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            imageUrl: selectedProduct.imageUrl,
            minDownPayment: 0.20, // Will be calculated based on credit score
            minTenure: 3,
            maxTenure: 12,
        });

        AuditLogger.logDeviceSelection(
            selectedProduct.id,
            selectedProduct.name,
            selectedProduct.price,
            data.userId
        );

        // Navigate to IMEI capture
        router.push('/sale/imei-capture');
    };

    const handleBack = () => {
        router.back();
    };

    const renderProduct = ({ item }: { item: Product }) => {
        const isSelected = item.id === selectedProductId;
        const exceedsLimit = item.price > maxLoanAmount;

        return (
            <TouchableOpacity
                onPress={() => handleSelectProduct(item)}
                disabled={!item.inStock || exceedsLimit}
                style={{ marginBottom: 16 }}
            >
                <Card
                    variant="outlined"
                    style={[
                        styles.productCard,
                        isSelected && styles.productCardSelected,
                        (!item.inStock || exceedsLimit) && styles.productCardDisabled,
                    ]}
                >
                    <View style={styles.productContent}>
                        {/* Product Image */}
                        <View style={styles.productImageContainer}>
                            {item.imageUrl ? (
                                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                            ) : (
                                <View style={styles.productImagePlaceholder}>
                                    <Text style={styles.productImagePlaceholderText}>📱</Text>
                                </View>
                            )}
                        </View>

                        {/* Product Details */}
                        <View style={styles.productDetails}>
                            <Text style={styles.productBrand}>{item.brand}</Text>
                            <Text style={styles.productName}>{item.name}</Text>
                            {item.specifications && (
                                <Text style={styles.productSpecs}>{item.specifications}</Text>
                            )}
                            <Text style={styles.productPrice}>{formatAmount(item.price)}</Text>

                            {/* Status Badges */}
                            <View style={styles.badgeContainer}>
                                {!item.inStock && (
                                    <View style={[styles.badge, styles.badgeOutOfStock]}>
                                        <Text style={styles.badgeText}>Out of Stock</Text>
                                    </View>
                                )}
                                {exceedsLimit && (
                                    <View style={[styles.badge, styles.badgeExceedsLimit]}>
                                        <Text style={styles.badgeText}>Exceeds Limit</Text>
                                    </View>
                                )}
                                {isSelected && (
                                    <View style={[styles.badge, styles.badgeSelected]}>
                                        <Text style={styles.badgeText}>✓ Selected</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <StepContainer
            title="Select Device"
            subtitle={`Max loan amount: ${formatAmount(maxLoanAmount)}`}
            onContinue={handleContinue}
            onBack={handleBack}
            continueLabel="Continue to IMEI"
            continueDisabled={!selectedProductId}
            showProgress
            steps={ONBOARDING_STEPS}
            currentStepId="device"
            showBackButton
        >
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading devices...</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        <Card variant="outlined" style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ ...typography.body.md, color: colors.textSecondary }}>
                                No devices available
                            </Text>
                        </Card>
                    }
                    scrollEnabled={false}
                />
            )}

            <Card variant="outlined" style={{ padding: 16, backgroundColor: '#dbeafe', marginTop: 16 }}>
                <Text style={{ ...typography.label.sm, color: colors.textSecondary, marginBottom: 4 }}>
                    💡 Device Selection
                </Text>
                <Text style={{ ...typography.body.xs, color: colors.textSecondary, lineHeight: 18 }}>
                    Only devices within the customer's loan limit are available. The price includes all taxes and fees.
                </Text>
            </Card>
        </StepContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    loadingText: {
        ...typography.body.md,
        color: colors.textSecondary,
        marginTop: 16,
    },
    productCard: {
        padding: 16,
    },
    productCardSelected: {
        borderColor: colors.primary,
        borderWidth: 2,
        backgroundColor: colors.primaryLight,
    },
    productCardDisabled: {
        opacity: 0.5,
    },
    productContent: {
        flexDirection: 'row',
    },
    productImageContainer: {
        marginRight: 16,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    productImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    productImagePlaceholderText: {
        fontSize: 32,
    },
    productDetails: {
        flex: 1,
    },
    productBrand: {
        ...typography.label.sm,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    productName: {
        ...typography.heading.sm,
        color: colors.text,
        marginBottom: 4,
    },
    productSpecs: {
        ...typography.body.xs,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    productPrice: {
        ...typography.heading.md,
        color: colors.primary,
        marginBottom: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeOutOfStock: {
        backgroundColor: '#fee2e2',
    },
    badgeExceedsLimit: {
        backgroundColor: '#fef3c7',
    },
    badgeSelected: {
        backgroundColor: colors.primary,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
});
