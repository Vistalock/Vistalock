import { Stack } from 'expo-router';

export default function SaleLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: '600',
                },
            }}
        >
            <Stack.Screen
                name="phone-verification"
                options={{ title: 'Phone Verification' }}
            />
            <Stack.Screen
                name="otp-verification"
                options={{ title: 'OTP Verification' }}
            />
            <Stack.Screen
                name="customer-details"
                options={{ title: 'Customer Details' }}
            />
            <Stack.Screen
                name="kyc-capture"
                options={{ title: 'KYC Capture' }}
            />
            <Stack.Screen
                name="credit-check"
                options={{ title: 'Credit Check' }}
            />
            <Stack.Screen
                name="device-selection"
                options={{ title: 'Select Device' }}
            />
            <Stack.Screen
                name="imei-capture"
                options={{ title: 'IMEI Capture' }}
            />
            <Stack.Screen
                name="loan-terms"
                options={{ title: 'Loan Terms' }}
            />
            <Stack.Screen
                name="consent"
                options={{ title: 'Consent' }}
            />
            <Stack.Screen
                name="device-release"
                options={{ title: 'Device Release' }}
            />
        </Stack>
    );
}
