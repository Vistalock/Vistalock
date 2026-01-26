import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface InputProps {
    label?: string;
    error?: string;
    children: ReactNode;
    style?: ViewStyle;
}

export function Input({ label, error, children, style }: InputProps) {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            {children}
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        ...typography.bodySmall,
        color: colors.text,
        marginBottom: 8,
        fontWeight: '600',
    },
    error: {
        ...typography.caption,
        color: colors.error,
        marginTop: 4,
    },
});
