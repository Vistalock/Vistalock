import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { api, clearAuthToken } from '../../lib/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Scan, ChevronRight, User, Wallet, AlertCircle } from 'lucide-react-native';

const QuickAction = ({ title, icon: Icon, onPress, description }: { title: string, icon: any, onPress: () => void, description: string }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginBottom: 16 }}>
        <View style={{
            backgroundColor: colors.white,
            borderRadius: 16,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.gray[200],
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
        }}>
            <View style={{
                width: 48, height: 48,
                borderRadius: 24,
                backgroundColor: colors.primary + '15', // 15% opacity primary
                alignItems: 'center', justifyContent: 'center',
                marginRight: 16
            }}>
                <Icon size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ ...typography.heading.sm, color: colors.text }}>{title}</Text>
                <Text style={{ ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 }}>{description}</Text>
            </View>
            <ChevronRight size={20} color={colors.gray[400]} />
        </View>
    </TouchableOpacity>
);

const StatItem = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) => (
    <View style={{ flex: 1, backgroundColor: colors.white, padding: 16, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: colors.gray[100] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ ...typography.label.sm, color: colors.textSecondary }}>{label}</Text>
        </View>
        <Text style={{ ...typography.heading.md, color: colors.text }}>{value}</Text>
    </View>
);

export default function Dashboard() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        today: 0,
        pending: 0,
        limit: 10
    });

    const fetchStats = async () => {
        setRefreshing(true);
        try {
            const response = await api.get('/auth/agent/stats');
            setStats(response.data);
        } catch (error: any) {
            console.error('Failed to fetch stats:', error);
            if (error.response?.status === 401) {
                await handleLogout();
            }
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleLogout = async () => {
        await clearAuthToken();
        router.replace('/');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
            <StatusBar style="dark" />
            <ScrollView
                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStats} tintColor={colors.primary} />}
            >
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <View>
                        <Text style={{ ...typography.heading.lg, color: colors.text }}>Dashboard</Text>
                        <Text style={{ ...typography.bodySmall, color: colors.textSecondary }}>Main Branch • Plot 12</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={{ padding: 8 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.gray[200] }}>
                            <User size={20} color={colors.text} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* KPI Cards */}
                <View style={{ flexDirection: 'row', marginBottom: 32 }}>
                    <StatItem label="Today's Sales" value={stats.today} icon={Wallet} />
                    <StatItem label="Remaining" value={stats.limit - stats.today} icon={AlertCircle} />
                </View>

                {/* Primary Actions */}
                <Text style={{ ...typography.label.md, color: colors.textSecondary, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Actions
                </Text>

                <QuickAction
                    title="New Sale"
                    description="Start customer onboarding"
                    icon={Plus}
                    onPress={() => router.push('/sale')}
                />

                <QuickAction
                    title="Scan Device"
                    description="Check lock status"
                    icon={Scan}
                    onPress={() => router.push('/scan')}
                />

                {/* Recent Activity Section (Placeholder) */}
                <View style={{ marginTop: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={{ ...typography.heading.sm, color: colors.text }}>Recent Activity</Text>
                        <Button title="View All" variant="ghost" onPress={() => router.push('/applications')} />
                    </View>

                    {/* Empty State / Simplified List */}
                    <Card style={{ padding: 24, alignItems: 'center' }}>
                        <Text style={{ ...typography.bodySmall, color: colors.textSecondary }}>No recent transactions</Text>
                    </Card>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
