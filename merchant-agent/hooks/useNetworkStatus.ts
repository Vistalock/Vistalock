import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string | null;
}

/**
 * Custom hook to monitor network connectivity status
 * @returns Network status and helper functions
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isConnected: true,
        isInternetReachable: null,
        type: null,
    });
    const [showOfflineWarning, setShowOfflineWarning] = useState(false);

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected = state.isConnected ?? false;
            const reachable = state.isInternetReachable;

            setIsOnline(connected && (reachable !== false));
            setNetworkStatus({
                isConnected: connected,
                isInternetReachable: reachable,
                type: state.type,
            });

            // Show warning when going offline
            if (!connected || reachable === false) {
                setShowOfflineWarning(true);
            }
        });

        // Initial check
        NetInfo.fetch().then(state => {
            const connected = state.isConnected ?? false;
            const reachable = state.isInternetReachable;

            setIsOnline(connected && (reachable !== false));
            setNetworkStatus({
                isConnected: connected,
                isInternetReachable: reachable,
                type: state.type,
            });
        });

        return () => unsubscribe();
    }, []);

    const dismissWarning = () => {
        setShowOfflineWarning(false);
    };

    const checkConnection = async (): Promise<boolean> => {
        const state = await NetInfo.fetch();
        const connected = state.isConnected ?? false;
        const reachable = state.isInternetReachable;
        return connected && (reachable !== false);
    };

    return {
        isOnline,
        networkStatus,
        showOfflineWarning,
        dismissWarning,
        checkConnection,
    };
}
