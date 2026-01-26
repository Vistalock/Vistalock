import React, { ReactNode } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Button } from './ui/Button';
import { ProgressIndicator } from './ProgressIndicator';

interface Step {
    id: string;
    label: string;
    completed: boolean;
}

interface StepContainerProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    onContinue?: () => void;
    onBack?: () => void;
    continueLabel?: string;
    continueDisabled?: boolean;
    continueLoading?: boolean;
    showProgress?: boolean;
    steps?: Step[];
    currentStepId?: string;
    showBackButton?: boolean;
}

export function StepContainer({
    title,
    subtitle,
    children,
    onContinue,
    onBack,
    continueLabel = 'Continue',
    continueDisabled = false,
    continueLoading = false,
    showProgress = false,
    steps = [],
    currentStepId = '',
    showBackButton = false,
}: StepContainerProps) {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Progress Indicator */}
            {showProgress && steps.length > 0 && currentStepId && (
                <ProgressIndicator steps={steps} currentStepId={currentStepId} />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>

                    {/* Content */}
                    <View style={styles.content}>{children}</View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        {showBackButton && onBack && (
                            <Button
                                title="Back"
                                onPress={onBack}
                                variant="outline"
                                style={styles.backButton}
                            />
                        )}
                        {onContinue && (
                            <Button
                                title={continueLabel}
                                onPress={onContinue}
                                disabled={continueDisabled}
                                loading={continueLoading}
                                variant="primary"
                                style={showBackButton ? styles.continueButton : undefined}
                            />
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        ...typography.h2,
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
    },
    content: {
        flex: 1,
    },
    actions: {
        marginTop: 24,
        gap: 12,
    },
    backButton: {
        marginBottom: 8,
    },
    continueButton: {
        flex: 1,
    },
});
