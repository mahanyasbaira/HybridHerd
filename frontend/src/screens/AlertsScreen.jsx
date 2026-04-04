import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import RiskBadge from '../components/RiskBadge';
import { fetchAlerts, acknowledgeAlert } from '../utils/api';

const AlertsScreen = () => {
  const {
    data: alerts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    refetchInterval: 30000,
  });

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      Alert.alert('Success', 'Alert acknowledged.');
      refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to acknowledge alert.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertContent}>
        <View style={styles.alertHeader}>
          <Text style={styles.animalName}>{item.animal_name}</Text>
          <RiskBadge level={item.risk} size="sm" />
        </View>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <Pressable
        onPress={() => handleAcknowledge(item.id)}
        style={({ pressed }) => [
          styles.acknowledgeButton,
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={styles.acknowledgeText}>Acknowledge</Text>
      </Pressable>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading alerts...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: '#dc2626' }]}>
            Unable to load alerts.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No active alerts.</Text>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: '#000000',
    },
    alertCard: {
      backgroundColor: '#ffffff',
      borderRadius: 4,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 4,
    },
    alertContent: {
      flex: 1,
      marginRight: 12,
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    animalName: {
      fontSize: 20,
      fontWeight: '700',
      color: '#000000',
    },
    timestamp: {
      fontSize: 16,
      color: '#9ca3af',
    },
    acknowledgeButton: {
      backgroundColor: '#1f2937',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 4,
    },
    acknowledgeText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
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
        <Text style={styles.title}>Active Alerts</Text>
      </View>

      {alerts.length > 0 ? (
        <FlatList
          data={alerts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        renderEmpty()
      )}
    </SafeAreaView>
  );
};

export default AlertsScreen;
