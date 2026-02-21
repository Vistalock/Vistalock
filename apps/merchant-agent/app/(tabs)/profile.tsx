import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Wallet, Bell, HeadphonesIcon, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react-native';

export default function ProfileScreen() {
    const router = useRouter();

    const handleLogout = () => {
        router.replace('/');
    };

    const menuItems = [
        { id: 'commissions', title: 'My Commissions', icon: <Wallet size={24} color="#0EA5E9" />, subtitle: '₦125,000 available' },
        { id: 'notifications', title: 'Notifications', icon: <Bell size={24} color="#F59E0B" />, subtitle: '3 unread' },
        { id: 'support', title: 'Help & Support', icon: <HeadphonesIcon size={24} color="#8B5CF6" />, subtitle: 'Escalate an issue' },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>AO</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>Agent Omotola</Text>
                        <Text style={styles.email}>agent@vistalock.com</Text>
                        <View style={styles.statusBadge}>
                            <CheckCircle2 size={12} color="#16A34A" />
                            <Text style={styles.statusText}>Active Agent</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>42</Text>
                    <Text style={styles.statLabel}>Total Sales</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>98%</Text>
                    <Text style={styles.statLabel}>Recovery</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>₦12m</Text>
                    <Text style={styles.statLabel}>Portfolio</Text>
                </View>
            </View>

            <View style={styles.menuContainer}>
                <Text style={styles.sectionTitle}>Account</Text>

                {menuItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => router.push(`/profile/${item.id}` as any)}
                    >
                        <View style={styles.menuIcon}>{item.icon}</View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        </View>
                        <ChevronRight size={20} color="#CBD5E1" />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.logoutContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { padding: 24, paddingTop: 60, backgroundColor: '#fff' },
    profileHeader: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#16A34A',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    profileInfo: { flex: 1 },
    name: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
    email: { fontSize: 14, color: '#64748B', marginBottom: 8 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: { fontSize: 12, fontWeight: 'bold', color: '#16A34A', marginLeft: 4 },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 24,
        marginTop: 24,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statBox: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
    statLabel: { fontSize: 13, color: '#64748B' },
    statDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0' },
    menuContainer: { padding: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    menuIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuTextContainer: { flex: 1 },
    menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 },
    menuSubtitle: { fontSize: 13, color: '#64748B' },
    logoutContainer: { paddingHorizontal: 24, paddingBottom: 40 },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
    },
    logoutText: { fontSize: 16, fontWeight: 'bold', color: '#EF4444', marginLeft: 8 },
});
