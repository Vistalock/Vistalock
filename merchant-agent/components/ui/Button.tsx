import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
}: ButtonProps) {
    const buttonStyle: ViewStyle[] = [
        styles.button,
        styles[variant],
        styles[`${size}Button`],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
    ].filter(Boolean) as ViewStyle[];

    const textStyle: TextStyle[] = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
    ].filter(Boolean) as TextStyle[];

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
            ) : (
                <Text style={textStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    danger: {
        backgroundColor: colors.error,
    },
    disabled: {
        opacity: 0.5,
    },
    fullWidth: {
        width: '100%',
    },
    smallButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    mediumButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    largeButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
    },
    text: {
        ...typography.button,
    },
    primaryText: {
        color: colors.white,
    },
    secondaryText: {
        color: colors.white,
    },
    outlineText: {
        color: colors.primary,
    },
    dangerText: {
        color: colors.white,
    },
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },
});
