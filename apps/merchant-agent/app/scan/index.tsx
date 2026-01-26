import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';


export default function ScanScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
            <StatusBar style="light" />
            <Text className="text-white text-2xl font-bold mb-4">Device Scanner</Text>
            <Text className="text-gray-400 mb-8 max-w-xs text-center">Camera functionality requires physical device or configuring permissions in emulator.</Text>

            <TouchableOpacity onPress={() => router.back()} className="bg-slate-700 px-6 py-3 rounded-xl">
                <Text className="text-white">Go Back</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
