import React from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';
import { clearAuthToken } from '../../lib/api';

export default function ProfileScreen() {
    const router = useRouter();

    const handleLogout = async () => {
        await clearAuthToken();
        router.replace('/');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />
            <View style={{ padding: 24 }}>
                <Text style={{ ...typography.heading.lg, color: colors.text, marginBottom: 24 }}>
                    Agent Profile
                </Text>

                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                    <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <Text style={{ fontSize: 40 }}>👤</Text>
                    </View>
                    <Text style={{ ...typography.heading.md, color: colors.text }}>Agent Smith</Text>
                    <Text style={{ ...typography.body.md, color: colors.textSecondary }}>ID: AG-2023-8842</Text>
                </View>

                <Card style={{ marginBottom: 24 }}>
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ ...typography.label.sm, color: colors.textSecondary }}>Branch</Text>
                        <Text style={{ ...typography.body.md, color: colors.text }}>Lagos Main Branch, Ikeja</Text>
                    </View>
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ ...typography.label.sm, color: colors.textSecondary }}>Email</Text>
                        <Text style={{ ...typography.body.md, color: colors.text }}>agent.smith@vistalock.com</Text>
                    </View>
                    <View>
                        <Text style={{ ...typography.label.sm, color: colors.textSecondary }}>Performance</Text>
                        <Text style={{ ...typography.body.md, color: colors.success, fontWeight: 'bold' }}>Top 10%</Text>
                    </View>
                </Card>

                <Button
                    title="Logout"
                    variant="outline"
                    onPress={handleLogout}
                    textStyle={{ color: colors.error }}
                    style={{ borderColor: colors.error }}
                />
            </View>
        </SafeAreaView>
    );
}
