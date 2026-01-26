import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vistalock Merchant Agent</Text>
            <Text style={styles.subtitle}>Device Financing Made Simple</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/sale/phone-verification')}
            >
                <Text style={styles.buttonText}>Start New Sale</Text>
            </TouchableOpacity>

            <View style={styles.info}>
                <Text style={styles.infoText}>✅ 11 Onboarding Screens</Text>
                <Text style={styles.infoText}>✅ NIN Verification</Text>
                <Text style={styles.infoText}>✅ Credit Check Integration</Text>
                <Text style={styles.infoText}>✅ Device IMEI Scanning</Text>
                <Text style={styles.infoText}>✅ Digital Signature</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    info: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
});
