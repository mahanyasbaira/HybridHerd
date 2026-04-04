import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import RiskBadge from '../components/RiskBadge';
import TelemetryRow from '../components/TelemetryRow';
import SendToVetButton from '../components/SendToVetButton';
import { fetchAnimal } from '../utils/api';

const CowDetailScreen = ({ route, navigation }) => {
  const { animal_id } = route.params;

  const {
    data: animal,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['animal', animal_id],
    queryFn: () => fetchAnimal(animal_id),
  });

  const handleSent = () => {
    refetch();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    header: {
      marginBottom: 24,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    name: {
      fontSize: 28,
      fontWeight: '700',
      color: '#000000',
    },
    tagId: {
      fontSize: 18,
      color: '#9ca3af',
      marginBottom: 8,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: 12,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 22,
      color: '#6b7280',
    },
    errorText: {
      fontSize: 22,
      color: '#dc2626',
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading animal details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !animal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Unable to load details.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const noseRing = animal.nose_ring || {};
  const collar = animal.collar || {};
  const earTag = animal.ear_tag || {};

  const tempHighlight = noseRing.temperature_c && noseRing.temperature_c > 39.5;
  const rrHighlight = noseRing.respiratory_rate && noseRing.respiratory_rate > 40;
  const chewHighlight = collar.chew_frequency && collar.chew_frequency < 40;
  const coughHighlight = collar.cough_count && collar.cough_count > 2;
  const behaviorHighlight = earTag.behavior_index && earTag.behavior_index < 0.4;

  const showSendToVet =
    animal.current_risk === 'Medium' || animal.current_risk === 'High';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{animal.name}</Text>
            <RiskBadge level={animal.current_risk} size="lg" />
          </View>
          <Text style={styles.tagId}>{animal.tag_id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nose Ring</Text>
          {noseRing.temperature_c !== undefined && (
            <TelemetryRow
              label="Temperature"
              value={noseRing.temperature_c.toFixed(1)}
              unit="°C"
              highlight={tempHighlight}
            />
          )}
          {noseRing.respiratory_rate !== undefined && (
            <TelemetryRow
              label="Respiratory Rate"
              value={noseRing.respiratory_rate}
              unit="breaths/min"
              highlight={rrHighlight}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collar</Text>
          {collar.chew_frequency !== undefined && (
            <TelemetryRow
              label="Chew Frequency"
              value={collar.chew_frequency}
              unit="chews/hour"
              highlight={chewHighlight}
            />
          )}
          {collar.cough_count !== undefined && (
            <TelemetryRow
              label="Cough Count"
              value={collar.cough_count}
              unit="coughs/day"
              highlight={coughHighlight}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ear Tag</Text>
          {earTag.behavior_index !== undefined && (
            <TelemetryRow
              label="Behavior Index"
              value={earTag.behavior_index.toFixed(2)}
              highlight={behaviorHighlight}
            />
          )}
        </View>

        {showSendToVet && (
          <SendToVetButton
            alertId={animal.latest_alert_id}
            animalName={animal.name}
            onSent={handleSent}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CowDetailScreen;
