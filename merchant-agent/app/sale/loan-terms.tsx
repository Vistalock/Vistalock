import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StepContainer } from '../../components/StepContainer';
import { Card } from '../../components/ui/Card';
import { useOnboarding } from '../../context/OnboardingContext';
import { formatAmount } from '../../lib/validation';
import DojahService from '../../lib/dojah';
import AuditLogger from '../../lib/auditLogger';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const ONBOARDING_STEPS = [
    { id: 'phone', label: 'Phone', completed: true },
    { id: 'otp', label: 'OTP', completed: true },
    { id: 'customer', label: 'Details', completed: true },
    { id: 'kyc', label: 'KYC', completed: true },
    { id: 'credit', label: 'Credit', completed: true },
    { id: 'device', label: 'Device', completed: true },
    { id: 'imei', label: 'IMEI', completed: true },
    { id: 'terms', label: 'Terms', completed: false },
    { id: 'consent', label: 'Consent', completed: false },
    { id: 'release', label: 'Release', completed: false },
];

export default function LoanTermsScreen() {
    const router = useRouter();
    const { setLoanPlan, data } = useOnboarding();

    const [calculating, setCalculating] = useState(true);
    const [loanTerms, setLoanTerms] = useState<any>(null);

    const creditScore = data.creditScore?.score || 500;
    const devicePrice = data.selectedProduct?.price || 0;

    useEffect(() => {
        calculateLoanTerms();
    }, []);

    const calculateLoanTerms = () => {
        setCalculating(true);

        // Get loan terms based on credit score
        const terms = DojahService.getLoanTerms(creditScore);

        // Calculate loan details
        const downPayment = Math.round(devicePrice * terms.minDownPayment);
        const loanAmount = devicePrice - downPayment;
        const tenure = terms.maxTenure;
        const monthlyInterest = terms.interestRate;

        // Calculate monthly repayment (simple interest)
        const totalInterest = loanAmount * monthlyInterest * tenure;
        const totalRepayment = loanAmount + totalInterest;
        const monthlyRepayment = Math.round(totalRepayment / tenure);

        // Generate payment breakdown
        const breakdown = [];
        for (let i = 1; i <= tenure; i++) {
            breakdown.push({
                month: i,
                amount: monthlyRepayment,
                dueDate: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            });
        }

        const calculatedTerms = {
            devicePrice,
            downPayment,
            loanAmount,
            tenure,
            interestRate: monthlyInterest * 100, // Convert to percentage
            monthlyRepayment,
            totalRepayment,
            totalInterest,
            breakdown,
        };

        setLoanTerms(calculatedTerms);
        setCalculating(false);

        // Save to context
        setLoanPlan({
            downPayment,
            tenure,
            monthlyRepayment,
            totalRepayment,
            breakdown,
        });

        AuditLogger.log('LOAN_TERMS_CALCULATED', calculatedTerms, data.userId);
    };

    const handleContinue = () => {
        if (!loanTerms) {
            Alert.alert('Error', 'Loan terms not calculated. Please try again.');
            return;
        }

        AuditLogger.logStepCompleted('LOAN_TERMS', { tenure: loanTerms.tenure }, data.userId);
        router.push('/sale/consent');
    };

    const handleBack = () => {
        router.back();
    };

    if (calculating || !loanTerms) {
        return (
            <StepContainer
                title="Calculating Loan Terms"
                subtitle="Please wait..."
                showProgress
                steps={ONBOARDING_STEPS}
                currentStepId="terms"
            >
                <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>🧮</Text>
                    <Text style={{ ...typography.body.md, color: colors.textSecondary }}>
                        Calculating your loan terms...
                    </Text>
                </View>
            </StepContainer>
        );
    }

    return (
        <StepContainer
            title="Loan Terms"
            subtitle="Review the calculated loan terms"
            onContinue={handleContinue}
            onBack={handleBack}
            continueLabel="Continue to Consent"
            showProgress
            steps={ONBOARDING_STEPS}
            currentStepId="terms"
            showBackButton
        >
            {/* Summary Card */}
            <Card variant="elevated" style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Loan Summary</Text>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Device Price:</Text>
                    <Text style={styles.summaryValue}>{formatAmount(loanTerms.devicePrice)}</Text>
                </View>

                <View style={[styles.summaryRow, styles.summaryRowHighlight]}>
                    <Text style={styles.summaryLabel}>Down Payment ({loanTerms.downPayment / loanTerms.devicePrice * 100}%):</Text>
                    <Text style={[styles.summaryValue, styles.summaryValueHighlight]}>
                        {formatAmount(loanTerms.downPayment)}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Loan Amount:</Text>
                    <Text style={styles.summaryValue}>{formatAmount(loanTerms.loanAmount)}</Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Interest Rate:</Text>
                    <Text style={styles.summaryValue}>{loanTerms.interestRate.toFixed(1)}% per month</Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tenure:</Text>
                    <Text style={styles.summaryValue}>{loanTerms.tenure} months</Text>
                </View>

                <View style={styles.divider} />

                <View style={[styles.summaryRow, styles.summaryRowHighlight]}>
                    <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>Monthly Payment:</Text>
                    <Text style={[styles.summaryValue, styles.summaryValuePrimary]}>
                        {formatAmount(loanTerms.monthlyRepayment)}
                    </Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Repayment:</Text>
                    <Text style={styles.summaryValue}>{formatAmount(loanTerms.totalRepayment)}</Text>
                </View>
            </Card>

            {/* Payment Schedule */}
            <Card variant="outlined" style={{ padding: 20, marginTop: 16 }}>
                <Text style={styles.scheduleTitle}>Payment Schedule</Text>

                <View style={styles.scheduleHeader}>
                    <Text style={[styles.scheduleHeaderText, { flex: 1 }]}>Month</Text>
                    <Text style={[styles.scheduleHeaderText, { flex: 2 }]}>Due Date</Text>
                    <Text style={[styles.scheduleHeaderText, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
                </View>

                {loanTerms.breakdown.slice(0, 3).map((payment: any) => (
                    <View key={payment.month} style={styles.scheduleRow}>
                        <Text style={[styles.scheduleText, { flex: 1 }]}>{payment.month}</Text>
                        <Text style={[styles.scheduleText, { flex: 2 }]}>{payment.dueDate}</Text>
                        <Text style={[styles.scheduleText, { flex: 1.5, textAlign: 'right' }]}>
                            {formatAmount(payment.amount)}
                        </Text>
                    </View>
                ))}

                {loanTerms.tenure > 3 && (
                    <Text style={styles.scheduleMore}>
                        ... and {loanTerms.tenure - 3} more payments
                    </Text>
                )}
            </Card>

            {/* Info Card */}
            <Card variant="outlined" style={{ padding: 16, backgroundColor: '#dbeafe', marginTop: 16 }}>
                <Text style={{ ...typography.label.sm, color: colors.textSecondary, marginBottom: 4 }}>
                    💡 Important Information
                </Text>
                <Text style={{ ...typography.body.xs, color: colors.textSecondary, lineHeight: 18 }}>
                    These terms are calculated based on the customer's credit score and cannot be modified.
                    The device will be locked if payments are missed.
                </Text>
            </Card>
        </StepContainer>
    );
}

const styles = StyleSheet.create({
    summaryCard: {
        padding: 24,
    },
    summaryTitle: {
        ...typography.heading.md,
        color: colors.text,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryRowHighlight: {
        backgroundColor: colors.primaryLight,
        marginHorizontal: -12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    summaryLabel: {
        ...typography.body.sm,
        color: colors.textSecondary,
    },
    summaryValue: {
        ...typography.body.sm,
        color: colors.text,
        fontWeight: '600',
    },
    summaryValueHighlight: {
        color: colors.primary,
        fontWeight: '700',
    },
    summaryValuePrimary: {
        ...typography.heading.md,
        color: colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
    },
    scheduleTitle: {
        ...typography.heading.sm,
        color: colors.text,
        marginBottom: 16,
    },
    scheduleHeader: {
        flexDirection: 'row',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: 8,
    },
    scheduleHeaderText: {
        ...typography.label.sm,
        color: colors.textSecondary,
        fontWeight: '700',
    },
    scheduleRow: {
        flexDirection: 'row',
        paddingVertical: 8,
    },
    scheduleText: {
        ...typography.body.sm,
        color: colors.text,
    },
    scheduleMore: {
        ...typography.body.xs,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
});
