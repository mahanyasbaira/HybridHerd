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
import { getRiskColors } from '../utils/riskColors';

const formatTimestamp = (ts) => {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
};

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
      Alert.alert('Acknowledged', 'Alert has been marked as reviewed.');
      refetch();
    } catch {
      Alert.alert('Error', 'Failed to acknowledge. Please try again.');
    }
  };

  const renderItem = ({ item }) => {
    const riskColors = getRiskColors(item.risk);
    return (
      <View style={[styles.alertCard, { borderLeftColor: riskColors.bg }]}>
        <View style={styles.alertTop}>
          <View style={styles.alertLeft}>
            <Text style={styles.animalName}>{item.animal_name}</Text>
            <View style={styles.transitionRow}>
              <View style={[styles.prevRisk, { backgroundColor: getRiskColors(item.previous_risk || 'Low').lightBg }]}>
                <Text style={[styles.prevRiskText, { color: getRiskColors(item.previous_risk || 'Low').lightText }]}>
                  {item.previous_risk || 'Low'}
                </Text>
              </View>
              <Text style={styles.arrow}> → </Text>
              <RiskBadge level={item.risk} size="sm" />
            </View>
          </View>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        <Pressable
          onPress={() => handleAcknowledge(item.id)}
          style={({ pressed }) => [
            styles.acknowledgeButton,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Text style={styles.acknowledgeText}>✓ Acknowledge</Text>
        </Pressable>
      </View>
    );
  };

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
        <Text style={styles.emptyIcon}>✅</Text>
        <Text style={styles.emptyText}>No active alerts</Text>
        <Text style={styles.emptySubtext}>Your herd is healthy</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Alerts</Text>
        {alerts.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{alerts.length}</Text>
          </View>
        )}
      </View>

      {alerts.length > 0 ? (
        <FlatList
          data={alerts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        renderEmpty()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#0f172a',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 999,
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderLeftWidth: 5,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  alertLeft: {
    flex: 1,
    marginRight: 12,
  },
  animalName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  transitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prevRisk: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  prevRiskText: {
    fontSize: 13,
    fontWeight: '700',
  },
  arrow: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 0,
  },
  acknowledgeButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  acknowledgeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 22,
    color: '#475569',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 17,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default AlertsScreen;
