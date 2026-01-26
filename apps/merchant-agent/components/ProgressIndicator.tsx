import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface Step {
    id: string;
    label: string;
    completed: boolean;
}

interface ProgressIndicatorProps {
    steps: Step[];
    currentStepId: string;
}

export function ProgressIndicator({ steps, currentStepId }: ProgressIndicatorProps) {
    const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
    const completedCount = steps.filter(step => step.completed).length;
    const progressPercentage = Math.round((completedCount / steps.length) * 100);

    return (
        <View style={styles.container}>
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progressPercentage}%` },
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    Step {currentStepIndex + 1} of {steps.length}
                </Text>
            </View>

            {/* Step Indicators */}
            <View style={styles.stepsContainer}>
                {steps.map((step, index) => {
                    const isActive = step.id === currentStepId;
                    const isCompleted = step.completed;
                    const isPast = index < currentStepIndex;

                    return (
                        <View key={step.id} style={styles.stepItem}>
                            {/* Connector Line (before step) */}
                            {index > 0 && (
                                <View
                                    style={[
                                        styles.connector,
                                        (isCompleted || isPast) && styles.connectorCompleted,
                                    ]}
                                />
                            )}

                            {/* Step Circle */}
                            <View
                                style={[
                                    styles.stepCircle,
                                    isActive && styles.stepCircleActive,
                                    isCompleted && styles.stepCircleCompleted,
                                ]}
                            >
                                {isCompleted ? (
                                    <Text style={styles.checkmark}>✓</Text>
                                ) : (
                                    <Text
                                        style={[
                                            styles.stepNumber,
                                            isActive && styles.stepNumberActive,
                                        ]}
                                    >
                                        {index + 1}
                                    </Text>
                                )}
                            </View>

                            {/* Step Label */}
                            <Text
                                style={[
                                    styles.stepLabel,
                                    isActive && styles.stepLabelActive,
                                    isCompleted && styles.stepLabelCompleted,
                                ]}
                                numberOfLines={2}
                            >
                                {step.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    progressBarContainer: {
        marginBottom: 16,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        fontWeight: '600',
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    stepItem: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    connector: {
        position: 'absolute',
        top: 16,
        left: -50,
        right: '50%',
        height: 2,
        backgroundColor: '#e2e8f0',
    },
    connectorCompleted: {
        backgroundColor: colors.primary,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    stepCircleActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    stepCircleCompleted: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    stepNumberActive: {
        color: '#fff',
    },
    checkmark: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '700',
    },
    stepLabel: {
        fontSize: 10,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 14,
    },
    stepLabelActive: {
        color: colors.primary,
        fontWeight: '700',
    },
    stepLabelCompleted: {
        color: colors.text,
    },
});
