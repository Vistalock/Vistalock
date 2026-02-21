import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react-native';
import { api } from '../../lib/api';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/agents/notifications');
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle size={24} color="#16A34A" />;
            case 'WARNING': return <AlertTriangle size={24} color="#F59E0B" />;
            case 'INFO': return <Info size={24} color="#3B82F6" />;
            default: return <Bell size={24} color="#64748B" />;
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.notificationCard, !item.read && styles.unreadCard]}>
            <View style={styles.iconContainer}>
                {getIcon(item.type)}
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <View style={styles.timeContainer}>
                    <Clock size={12} color="#94A3B8" />
                    <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#16A34A" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Bell size={48} color="#CBD5E1" />
                        <Text style={styles.emptyStateTitle}>No Notifications</Text>
                        <Text style={styles.emptyStateText}>You're all caught up!</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    header: { padding: 24, paddingTop: 60, backgroundColor: '#16A34A' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    listContainer: { padding: 20 },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    unreadCard: {
        backgroundColor: '#F0FDF4',
        borderColor: '#16A34A',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    contentContainer: { flex: 1 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
    message: { fontSize: 14, color: '#475569', marginBottom: 8 },
    timeContainer: { flexDirection: 'row', alignItems: 'center' },
    timeText: { fontSize: 12, color: '#94A3B8', marginLeft: 4 },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#16A34A',
        alignSelf: 'center',
        marginLeft: 12,
    },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyStateTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginTop: 16 },
    emptyStateText: { fontSize: 14, color: '#64748B', marginTop: 8 },
});
