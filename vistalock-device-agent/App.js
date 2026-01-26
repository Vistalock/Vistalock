import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DeviceManager from './src/services/deviceManager';
import ActivationScreen from './src/screens/ActivationScreen';
import LockScreen from './src/screens/LockScreen';
import NormalScreen from './src/screens/NormalScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if device is registered
      const registered = await DeviceManager.isDeviceRegistered();
      setIsRegistered(registered);

      if (registered) {
        // Check lock status
        const lockState = await DeviceManager.getLockState();
        setIsLocked(lockState.isLocked);

        // Start background monitoring
        DeviceManager.startMonitoring();
      }
    } catch (error) {
      console.error('App initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivated = () => {
    setIsRegistered(true);
    setIsLocked(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // Show activation screen if not registered
  if (!isRegistered) {
    return <ActivationScreen onActivated={handleActivated} />;
  }

  // Show lock screen if device is locked
  if (isLocked) {
    return <LockScreen />;
  }

  // Show normal screen if device is active and unlocked
  return <NormalScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
