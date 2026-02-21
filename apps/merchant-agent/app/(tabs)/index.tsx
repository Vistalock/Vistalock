import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { PlusCircle, QrCode, ClipboardList, Wallet, Bell, ChevronRight, Activity, WifiOff } from 'lucide-react-native';
import { api } from '../../lib/api';
import { syncService } from '../../lib/sync';

export default function HomeScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ todaySales: 0, totalPortfolio: 0, overdueCount: 0, recoveryRate: 100 });
    const [loading, setLoading] = useState(true);
    const [queueCount, setQueueCount] = useState(0);

    const fetchStats = async () => {
        try {
            const res = await api.get('/agents/dashboard');
            setStats(res.data);
            const queue = await syncService.getQueue();
            setQueueCount(queue.length);
        } catch (error) {
            console.error('Failed to load dashboard stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, []);

    const statCards = [
        { title: "Today's Sales", value: stats.todaySales.toString(), icon: <ClipboardList size={20} color="#16A34A" />, bgColor: '#DCFCE7' },
        { title: "Portfolio", value: `₦${stats.totalPortfolio.toLocaleString()}`, icon: <Wallet size={20} color="#0284C7" />, bgColor: '#E0F2FE' },
        { title: "Overdue", value: stats.overdueCount.toString(), icon: <Bell size={20} color="#EF4444" />, bgColor: '#FEE2E2' },
    ];

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.agentName}>Agent Omotola</Text>
                </View>
                <TouchableOpacity style={styles.profileBadge}>
                    <Text style={styles.profileText}>AO</Text>
                </TouchableOpacity>
            </View>

            {/* Offline Sync Banner */}
            {queueCount > 0 && (
                <View style={styles.offlineBanner}>
                    <WifiOff size={20} color="#D97706" />
                    <Text style={styles.offlineBannerText}>
                        {queueCount} sale(s) saved offline. Will sync when online.
                    </Text>
                </View>
            )}

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
                {statCards.map((stat, index) => (
                    <View key={index} style={[styles.statCard, { backgroundColor: stat.bgColor }]}>
                        <View style={styles.iconContainer}>{stat.icon}</View>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statTitle}>{stat.title}</Text>
                    </View>
                ))}
            </View>

            {/* Primary Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.primaryAction]}
                    onPress={() => router.push('/sale' as any)}
                >
                    <View style={styles.actionIconWrapper}>
                        <PlusCircle size={28} color="#fff" />
                    </View>
                    <View style={styles.actionTextWrapper}>
                        <Text style={styles.actionTitleWhite}>Start New Sale</Text>
                        <Text style={styles.actionSubtitleWhite}>Onboard a new customer</Text>
                    </View>
                    <ChevronRight size={20} color="#fff" style={styles.chevron} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryAction]}
                    onPress={() => router.push('/scan' as any)}
                >
                    <View style={[styles.actionIconWrapper, { backgroundColor: '#F1F5F9' }]}>
                        <QrCode size={28} color="#0F172A" />
                    </View>
                    <View style={styles.actionTextWrapper}>
                        <Text style={styles.actionTitle}>Scan Device</Text>
                        <Text style={styles.actionSubtitle}>Check lock & eligibility</Text>
                    </View>
                    <ChevronRight size={20} color="#64748B" style={styles.chevron} />
                </TouchableOpacity>
            </View>

            {/* Recent Activity */}
            <View style={styles.activityHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/customers' as any)}>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.activityList}>
                {/* Mock Item 1 */}
                <View style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: '#DCFCE7' }]}>
                        <Activity size={20} color="#16A34A" />
                    </View>
                    <View style={styles.activityInfo}>
                        <Text style={styles.activityTarget}>John Doe (Samsung A14)</Text>
                        <Text style={styles.activityDesc}>Loan Approved</Text>
                    </View>
                    <Text style={styles.activityTime}>Just now</Text>
                </View>

                {/* Mock Item 2 */}
                <View style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: '#FEE2E2' }]}>
                        <Bell size={20} color="#EF4444" />
                    </View>
                    <View style={styles.activityInfo}>
                        <Text style={styles.activityTarget}>Mary Smith</Text>
                        <Text style={styles.activityDesc}>Missed Payment Alert</Text>
                    </View>
                    <Text style={styles.activityTime}>2h ago</Text>
                </View>
            </View>

            {/* Bottom Padding for scroll area */}
            <View style={styles.footerSpacing} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Slate 50
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    greeting: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    agentName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0F172A',
        marginTop: 4,
    },
    profileBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#16A34A',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    profileText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    offlineBanner: {
        flexDirection: 'row',
        backgroundColor: '#FEF3C7',
        marginHorizontal: 24,
        marginTop: 16, // added margin top
        marginBottom: 8,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    offlineBannerText: {
        color: '#B45309',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 24,
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        marginHorizontal: 8,
        padding: 16,
        borderRadius: 20,
        alignItems: 'flex-start',
    },
    iconContainer: {
        marginBottom: 12,
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 12,
        opacity: 0.9,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
        paddingHorizontal: 24,
        marginTop: 32,
        marginBottom: 16,
    },
    actionContainer: {
        paddingHorizontal: 24,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
    },
    primaryAction: {
        backgroundColor: '#16A34A',
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryAction: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    actionIconWrapper: {
        padding: 12,
        borderRadius: 16,
        marginRight: 16,
    },
    actionTextWrapper: {
        flex: 1,
    },
    actionTitleWhite: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    actionSubtitleWhite: {
        fontSize: 13,
        color: '#DCFCE7',
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#64748B',
    },
    chevron: {
        marginLeft: 8,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 24,
    },
    viewAll: {
        color: '#16A34A',
        fontWeight: '600',
        fontSize: 14,
        marginTop: 16, // offset to align with sectionTitle
    },
    activityList: {
        paddingHorizontal: 24,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    activityIcon: {
        padding: 12,
        borderRadius: 12,
        marginRight: 16,
    },
    activityInfo: {
        flex: 1,
    },
    activityTarget: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 4,
    },
    activityDesc: {
        fontSize: 13,
        color: '#64748B',
    },
    activityTime: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    footerSpacing: {
        height: 40,
    }
});
