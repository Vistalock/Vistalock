import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface OfflineBannerProps {
    visible: boolean;
    onDismiss?: () => void;
    queueCount?: number;
}

export function OfflineBanner({ visible, onDismiss, queueCount = 0 }: OfflineBannerProps) {
    const [slideAnim] = React.useState(new Animated.Value(-100));

    React.useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>📡</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Offline Mode</Text>
                    <Text style={styles.subtitle}>
                        {queueCount > 0
                            ? `${queueCount} action${queueCount > 1 ? 's' : ''} queued for sync`
                            : 'Some features unavailable'}
                    </Text>
                </View>
                {onDismiss && (
                    <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
                        <Text style={styles.dismissText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f59e0b',
        paddingVertical: 12,
        paddingHorizontal: 16,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 12,
    },
    icon: {
        fontSize: 20,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    dismissButton: {
        padding: 4,
    },
    dismissText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '700',
    },
});
