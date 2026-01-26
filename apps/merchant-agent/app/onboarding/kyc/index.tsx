import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../../context/OnboardingContext';

export default function KycScreen() {
    const router = useRouter();
    const { data, updateKyc } = useOnboarding();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [facing, setFacing] = useState<'front' | 'back'>('back');
    const [capturedId, setCapturedId] = useState<string | null>(data.kyc.idPhotoUri || null);
    const [capturedSelfie, setCapturedSelfie] = useState<string | null>(data.kyc.selfieUri || null);
    const [step, setStep] = useState<'ID' | 'SELFIE'>('ID');

    useEffect(() => {
        if (!permission?.granted) requestPermission();
    }, []);

    const takePicture = async () => {
        if (!cameraRef.current) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
            if (step === 'ID') {
                setCapturedId(photo?.uri || '');
            } else {
                setCapturedSelfie(photo?.uri || '');
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to take picture');
        }
    };

    const confirmPhoto = () => {
        if (step === 'ID') {
            setStep('SELFIE');
            setFacing('front');
        } else {
            // Both done
            updateKyc({ idPhotoUri: capturedId!, selfieUri: capturedSelfie! });
            router.push('/onboarding/product');
        }
    };

    const retake = () => {
        if (step === 'ID') setCapturedId(null);
        else setCapturedSelfie(null);
    };

    if (!permission) {
        // Camera permissions are still loading.
        return <View className="flex-1 bg-slate-900" />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
                <Text className="text-white mb-4">Camera permission required</Text>
                <TouchableOpacity onPress={requestPermission} className="bg-green-600 px-6 py-3 rounded-xl">
                    <Text className="text-white font-bold">Grant Permission</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // REVIEW MODE
    const currentImage = step === 'ID' ? capturedId : capturedSelfie;
    if (currentImage) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
                <View className="flex-1 justify-center items-center">
                    <Image source={{ uri: currentImage }} className="w-full h-4/5" resizeMode="contain" />
                    <View className="absolute bottom-10 flex-row space-x-4">
                        <TouchableOpacity onPress={retake} className="bg-red-600 px-8 py-4 rounded-xl">
                            <Text className="text-white font-bold">Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={confirmPhoto} className="bg-green-600 px-8 py-4 rounded-xl">
                            <Text className="text-white font-bold">Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // CAMERA MODE
    return (
        <View className="flex-1 bg-black">
            <CameraView
                ref={cameraRef}
                style={{ flex: 1 }}
                facing={facing}
            >
                <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', padding: 24 }}>
                    <View className="bg-black/50 p-4 rounded-xl">
                        <Text className="text-white text-center font-bold text-xl">
                            {step === 'ID' ? 'Capture Valid ID Card' : 'Capture Customer Selfie'}
                        </Text>
                        <Text className="text-gray-300 text-center text-sm mt-1">
                            {step === 'ID' ? 'Ensure text is readable and corners are visible.' : 'Ensure face is well-lit and unobstructed.'}
                        </Text>
                    </View>

                    <View className="items-center mb-8">
                        <TouchableOpacity
                            onPress={takePicture}
                            className="w-20 h-20 rounded-full border-4 border-white bg-white/20 items-center justify-center"
                        >
                            <View className="w-16 h-16 rounded-full bg-white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </CameraView>
        </View>
    );
}
