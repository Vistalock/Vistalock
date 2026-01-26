import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function SupportScreen() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        if (!message) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Ticket Created', 'Support team will contact you shortly.');
            setMessage('');
        }, 1500);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />
            <View style={{ padding: 24 }}>
                <Text style={{ ...typography.heading.lg, color: colors.text, marginBottom: 8 }}>
                    Support
                </Text>
                <Text style={{ ...typography.body.md, color: colors.textSecondary, marginBottom: 24 }}>
                    Report an issue or request assistance.
                </Text>

                <Input
                    label="Issue Description"
                    placeholder="Describe the problem..."
                    multiline
                    numberOfLines={6}
                    style={{ height: 120, textAlignVertical: 'top' }}
                    value={message}
                    onChangeText={setMessage}
                />

                <Button
                    title="Submit Ticket"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={!message}
                />
            </View>
        </SafeAreaView>
    );
}
