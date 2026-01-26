import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export type StatusType = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'DEFAULTED' | 'COMPLETED' | 'REVIEW';

interface StatusBadgeProps {
    status: StatusType | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const getStatusStyles = (statusVal: string) => {
        switch (statusVal.toUpperCase()) {
            case 'APPROVED':
            case 'ACTIVE':
            case 'COMPLETED':
            case 'UNLOCKED':
                return { bg: colors.primaryLight, text: colors.primaryDark };
            case 'PENDING':
            case 'REVIEW':
            case 'PENDING_SETUP':
                return { bg: '#fef3c7', text: '#d97706' }; // amber-100, amber-600
            case 'REJECTED':
            case 'DEFAULTED':
            case 'LOCKED':
                return { bg: '#fee2e2', text: '#b91c1c' }; // red-100, red-700
            default:
                return { bg: colors.border, text: colors.textSecondary };
        }
    };

    const { bg, text } = getStatusStyles(status);

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            <Text style={[styles.text, { color: text }]}>
                {status.toUpperCase().replace('_', ' ')}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
