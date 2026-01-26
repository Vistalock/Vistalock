import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineBanner() {
    const isOnline = useNetworkStatus();
    const insets = useSafeAreaInsets();

    if (isOnline) {
        return null;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                <WifiOff size={20} color="#fff" />
                <Text style={styles.text}>No Internet Connection</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#EF4444',
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 8,
    },
    text: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
