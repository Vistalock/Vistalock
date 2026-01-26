import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/ui/Card';
import { StatusBadge, StatusType } from '../../components/ui/StatusBadge';

export default function ApplicationsScreen() {
    const router = useRouter();
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'ACTIVE'>('ALL');
    const [search, setSearch] = useState('');

    const applications = [
        { id: '1', name: 'John Doe', device: 'iPhone 13', status: 'APPROVED', date: '2023-10-01' },
        { id: '2', name: 'Sarah Connor', device: 'Samsung S21', status: 'PENDING', date: '2023-10-02' },
        { id: '3', name: 'Kyle Reese', device: 'Infinix Hot 10', status: 'ACTIVE', date: '2023-09-15' },
        { id: '4', name: 'Ellen Ripley', device: 'Tecno Spark', status: 'REJECTED', date: '2023-10-03' },
    ];

    const filteredApps = applications.filter(app => {
        const matchesFilter = filter === 'ALL' || app.status === filter;
        const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />
            <View style={{ padding: 24, paddingBottom: 16 }}>
                <Text style={{ ...typography.heading.lg, color: colors.text, marginBottom: 16 }}>
                    Applications
                </Text>

                {/* Search */}
                <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
                    <TextInput
                        placeholder="Search customer name..."
                        value={search}
                        onChangeText={setSearch}
                        style={{ fontSize: 16 }}
                    />
                </View>

                {/* Filter Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                    {['ALL', 'PENDING', 'APPROVED', 'ACTIVE'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f as any)}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                backgroundColor: filter === f ? colors.primary : colors.border,
                                marginRight: 8
                            }}
                        >
                            <Text style={{
                                color: filter === f ? 'white' : colors.textSecondary,
                                fontWeight: '600'
                            }}>
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0 }}>
                {filteredApps.map((app) => (
                    <Card key={app.id} style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View>
                                <Text style={{ ...typography.heading.sm, color: colors.text }}>{app.name}</Text>
                                <Text style={{ ...typography.body.sm, color: colors.textSecondary }}>{app.device}</Text>
                                <Text style={{ ...typography.body.xs, color: colors.textSecondary, marginTop: 4 }}>{app.date}</Text>
                            </View>
                            <StatusBadge status={app.status as StatusType} />
                        </View>
                    </Card>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
