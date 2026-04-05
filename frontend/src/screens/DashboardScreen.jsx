import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import CattleCard from '../components/CattleCard';
import { fetchAnimals } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const FILTERS = [
  { label: 'All Cattle', value: 'All', color: '#475569' },
  { label: 'Medium Risk', value: 'Medium', color: '#d97706' },
  { label: 'High Risk', value: 'High', color: '#dc2626' },
];

const DashboardScreen = ({ navigation }) => {
  const [riskFilter, setRiskFilter] = useState('All');
  const { user } = useAuth();

  const {
    data: animals = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['animals', riskFilter],
    queryFn: () => fetchAnimals(riskFilter),
    refetchInterval: 30000,
  });

  const { data: allAnimals = [] } = useQuery({
    queryKey: ['animals', 'All'],
    queryFn: () => fetchAnimals('All'),
    refetchInterval: 30000,
  });

  const highCount = allAnimals.filter((a) => a.current_risk === 'High').length;
  const mediumCount = allAnimals.filter((a) => a.current_risk === 'Medium').length;

  const handleAnimalPress = (animal) => {
    navigation.navigate('CowDetail', { animal_id: animal.id });
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading herd data...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: '#dc2626' }]}>
            Unable to connect. Check your network.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No cattle match this filter.</Text>
      </View>
    );
  };

  const ListHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Welcome'}
          </Text>
          <Text style={styles.title}>HybridHerd</Text>
        </View>
        <View style={styles.brandMark}>
          <Text style={styles.brandIcon}>🐄</Text>
        </View>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{allAnimals.length}</Text>
          <Text style={styles.statLabel}>Total Head</Text>
        </View>
        <View style={[styles.statCard, styles.statCardBorder]}>
          <Text style={[styles.statNumber, highCount > 0 && styles.statNumberAlert]}>
            {highCount}
          </Text>
          <Text style={styles.statLabel}>High Risk</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, mediumCount > 0 && styles.statNumberWarn]}>
            {mediumCount}
          </Text>
          <Text style={styles.statLabel}>Medium Risk</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setRiskFilter(f.value)}
            style={({ pressed }) => [
              styles.filterChip,
              riskFilter === f.value && { backgroundColor: f.color, borderColor: f.color },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                riskFilter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>
        {riskFilter === 'All' ? 'Your Herd' : `${riskFilter} Risk Animals`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={animals.length > 0 ? animals : []}
        renderItem={({ item }) => (
          <CattleCard animal={item} onPress={() => handleAnimalPress(item)} />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#16a34a"
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  listContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#0f172a',
  },
  greeting: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIcon: {
    fontSize: 28,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statCardBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 38,
  },
  statNumberAlert: {
    color: '#f87171',
  },
  statNumberWarn: {
    color: '#fbbf24',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  filterText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default DashboardScreen;
