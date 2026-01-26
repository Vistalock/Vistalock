import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { OnboardingProvider } from '../context/OnboardingContext';

export default function RootLayout() {
    return (
        <>
            <StatusBar style="auto" />
            <OnboardingProvider>
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="sale" />
                </Stack>
            </OnboardingProvider>
        </>
    );
}
