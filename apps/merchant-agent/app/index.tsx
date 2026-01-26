import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Shield } from 'lucide-react-native';
import { api } from '../lib/api';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('agent@vistalock.com');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await api.post('/auth/login', {
                email,
                password,
            });
            router.replace('/dashboard');
        } catch (error: any) {
            console.error('Login failed:', error);

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.status === 401) {
                    alert('Invalid credentials. Please check your email and password.');
                } else if (error.response.status >= 500) {
                    alert('Server error. Please try again later.');
                } else {
                    alert(`Error: ${error.response.data?.message || 'Something went wrong'}`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser 
                // and an instance of http.ClientRequest in node.js
                alert('Connection Error: Unable to reach the server. Please check your internet connection or ensure the server is running.');
            } else {
                // Something happened in setting up the request that triggered an Error
                alert(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                    <Shield size={64} color="#007A5E" fill="#D1FAE5" />
                </View>
                <Text style={styles.title}>VistaLock Agent</Text>
                <Text style={styles.subtitle}>Secure BNPL Onboarding</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="agent@company.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Logging in...' : 'Login to Account'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Device ID: 0fde829a5b09...</Text>
                    <Text style={styles.footerText}>v1.0.0</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoCircle: {
        width: 100,
        height: 100,
        backgroundColor: '#F0FDF4',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#0F172A',
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#16A34A',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 48,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 4,
    }
});
