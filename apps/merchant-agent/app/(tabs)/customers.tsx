import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Search, ChevronRight, User } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function CustomersScreen() {
    const router = useRouter();
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await api.get('/agents/customers');
                setCustomers(res.data);
            } catch (error) {
                console.error('Failed to load customers', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Customers</Text>
                <Text style={styles.subtitle}>Manage your onboarded customers</Text>
            </View>

            <View style={styles.searchContainer}>
                <Search size={20} color="#94A3B8" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or phone number"
                />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#16A34A" />
                </View>
            ) : (
                <ScrollView style={styles.listContainer}>
                    {customers.map((customer) => (
                        <TouchableOpacity
                            key={customer.id}
                            style={styles.customerCard}
                            // Will route to a detailed profile page
                            onPress={() => { }}
                        >
                            <View style={styles.avatar}>
                                <User size={24} color="#64748B" />
                            </View>
                            <View style={styles.info}>
                                <Text style={styles.name}>{customer.name}</Text>
                                <Text style={styles.device}>{customer.device}</Text>
                                <Text style={styles.phone}>{customer.phone}</Text>
                            </View>
                            <View style={styles.statusBox}>
                                <Text style={[
                                    styles.statusText,
                                    customer.loanStatus === 'ACTIVE' && styles.statusActive,
                                    customer.loanStatus === 'OVERDUE' && styles.statusOverdue,
                                    customer.loanStatus === 'PENDING' && styles.statusPending,
                                ]}>
                                    {customer.loanStatus}
                                </Text>
                                <ChevronRight size={20} color="#CBD5E1" style={{ marginTop: 8 }} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { padding: 24, paddingBottom: 16, paddingTop: 60, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#64748B' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#0F172A' },
    listContainer: { paddingHorizontal: 24 },
    customerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 },
    device: { fontSize: 13, color: '#475569', marginBottom: 2 },
    phone: { fontSize: 13, color: '#94A3B8' },
    statusBox: { alignItems: 'flex-end' },
    statusText: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
    statusActive: { backgroundColor: '#DCFCE7', color: '#16A34A' },
    statusOverdue: { backgroundColor: '#FEE2E2', color: '#EF4444' },
    statusPending: { backgroundColor: '#FEF3C7', color: '#D97706' },
});
