import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Button } from './ui/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface CameraComponentProps {
    onCapture: (uri: string) => void;
    onClose: () => void;
    type?: 'front' | 'back';
    overlayText?: string;
}

export function CameraComponent({ onCapture, onClose, type = 'back', overlayText }: CameraComponentProps) {
    const [facing, setFacing] = useState<CameraType>(type);
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [taking, setTaking] = useState(false);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ ...typography.body.md, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 }}>
                    We need your permission to show the camera
                </Text>
                <Button onPress={requestPermission} title="Grant Permission" />
                <Button onPress={onClose} title="Cancel" variant="ghost" style={{ marginTop: 10 }} />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current && !taking) {
            setTaking(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.7,
                    base64: false,
                    exif: false
                });
                if (photo?.uri) {
                    onCapture(photo.uri);
                }
            } catch (error) {
                console.error("Capture failed", error);
            } finally {
                setTaking(false);
            }
        }
    };

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.guideContainer}>
                        {overlayText && <Text style={styles.guideText}>{overlayText}</Text>}
                        <View style={styles.guideBox} />
                    </View>

                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                            <Text style={styles.text}>Flip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.captureBtn, taking && { opacity: 0.5 }]}
                            onPress={takePicture}
                            disabled={taking}
                        >
                            <View style={styles.captureInner} />
                        </TouchableOpacity>

                        <View style={{ width: 50 }} />
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'column',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 8,
    },
    closeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    guideContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideBox: {
        width: 300,
        height: 200,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 16,
        backgroundColor: 'transparent',
    },
    guideText: {
        color: 'white',
        marginBottom: 20,
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    controls: {
        height: 120,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingBottom: 20,
    },
    button: {
        padding: 10,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    captureBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    }
});
