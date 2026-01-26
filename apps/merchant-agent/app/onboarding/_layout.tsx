import { Stack } from 'expo-router';
import { OnboardingProvider } from '../../context/OnboardingContext';

export default function OnboardingLayout() {
    return (
        <OnboardingProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ title: 'Customer Info' }} />
                <Stack.Screen name="kyc/index" options={{ title: 'KYC Capture' }} />
                <Stack.Screen name="device/index" options={{ title: 'Device Binding' }} />
                <Stack.Screen name="summary/index" options={{ title: 'Review' }} />
            </Stack>
        </OnboardingProvider>
    );
}
