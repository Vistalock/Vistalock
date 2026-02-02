import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface CardProps {
    children: ReactNode;
    style?: ViewStyle;
    padding?: number;
    variant?: 'elevated' | 'outlined';
}

export function Card({ children, style, padding = 16, variant = 'elevated' }: CardProps) {
    return (
        <View style={[
            variant === 'elevated' ? styles.elevated : styles.outlined,
            { padding },
            style
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    elevated: {
        backgroundColor: colors.white,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    outlined: {
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray[200] || '#e2e8f0',
    }
});
