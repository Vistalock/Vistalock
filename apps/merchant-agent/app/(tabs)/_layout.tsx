import { Tabs } from 'expo-router';
import { Home, Users, Smartphone, User } from 'lucide-react-native';
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncService } from '../../lib/sync';

export default function TabLayout() {
    useEffect(() => {
        // Listen for network state changes
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected && state.isInternetReachable) {
                // We are back online, attempt to flush the queue
                syncService.flushQueue().then(syncedCount => {
                    if (syncedCount > 0) {
                        console.log(`Successfully synced ${syncedCount} offline sales in the background.`);
                        // In a real app, we might trigger a global toast/notification here
                    }
                });
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#16A34A', // VistaLock Primary Green
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#E2E8F0',
                    elevation: 0,
                    shadowOpacity: 0,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="customers"
                options={{
                    title: 'Customers',
                    tabBarIcon: ({ color }) => <Users size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="devices"
                options={{
                    title: 'Devices',
                    tabBarIcon: ({ color }) => <Smartphone size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
