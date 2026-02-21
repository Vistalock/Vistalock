import { Stack } from 'expo-router';
import { SaleProvider } from './SaleContext';

export default function SaleLayout() {
    return (
        <SaleProvider>
            <Stack
                screenOptions={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#16A34A', // VistaLock Green
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: '600',
                    },
                    contentStyle: {
                        backgroundColor: '#F8FAFC'
                    }
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{ title: 'Step 1: Select Product', headerBackTitle: 'Cancel' }}
                />
                <Stack.Screen
                    name="step2-scan"
                    options={{ title: 'Step 2: Scan Device' }}
                />
                <Stack.Screen
                    name="step3-customer"
                    options={{ title: 'Step 3: Customer Details' }}
                />
                <Stack.Screen
                    name="step4-payment"
                    options={{ title: 'Step 4: Down Payment' }}
                />
                <Stack.Screen
                    name="step5-submit"
                    options={{ title: 'Step 5: Review & Submit' }}
                />
            </Stack>
        </SaleProvider>
    );
}
