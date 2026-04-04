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

const DashboardScreen = ({ navigation }) => {
  const [riskFilter, setRiskFilter] = useState('All');

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

  const handleAnimalPress = (animal) => {
    navigation.navigate('CowDetail', { animal_id: animal.id });
  };

  const onRefresh = () => {
    refetch();
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
        <Text style={styles.emptyText}>No cattle registered.</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <CattleCard animal={item} onPress={() => handleAnimalPress(item)} />
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: '#000000',
    },
    subtitle: {
      fontSize: 18,
      color: '#9ca3af',
      marginTop: 4,
    },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    filterChip: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: '#f3f4f6',
    },
    filterChipActive: {
      backgroundColor: '#1f2937',
    },
    filterText: {
      fontSize: 18,
      color: '#6b7280',
      fontWeight: '600',
    },
    filterTextActive: {
      color: '#ffffff',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    emptyText: {
      fontSize: 22,
      color: '#6b7280',
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HybridHerd</Text>
        <Text style={styles.subtitle}>Cattle Health Monitor</Text>
      </View>

      <View style={styles.filterRow}>
        {['All', 'Medium', 'High'].map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setRiskFilter(filter)}
            style={({ pressed }) => [
              styles.filterChip,
              riskFilter === filter && styles.filterChipActive,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                riskFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      {animals.length > 0 ? (
        <FlatList
          data={animals}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
        />
      ) : (
        renderEmpty()
      )}
    </SafeAreaView>
  );
};

export default DashboardScreen;
