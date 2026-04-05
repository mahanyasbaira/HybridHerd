import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import RiskBadge from '../components/RiskBadge';
import TelemetryRow from '../components/TelemetryRow';
import SendToVetButton from '../components/SendToVetButton';
import { fetchAnimal } from '../utils/api';
import { getRiskColors } from '../utils/riskColors';

const SensorCard = ({ title, icon, children, accentColor = '#0ea5e9' }) => (
  <View style={styles.sensorCard}>
    <View style={[styles.sensorHeader, { borderLeftColor: accentColor }]}>
      <Text style={styles.sensorIcon}>{icon}</Text>
      <Text style={styles.sensorTitle}>{title}</Text>
    </View>
    <View style={styles.sensorBody}>{children}</View>
  </View>
);

const CowDetailScreen = ({ route, navigation }) => {
  const { animal_id } = route.params;
  const [aiBriefing, setAiBriefing] = useState(null);

  const {
    data: animal,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['animal', animal_id],
    queryFn: () => fetchAnimal(animal_id),
  });

  const handleSent = () => refetch();
  const handleAiBriefing = (briefing) => setAiBriefing(briefing);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading animal details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !animal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Unable to load details.</Text>
          <Pressable style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const riskColors = getRiskColors(animal.current_risk);
  const noseRing = animal.nose_ring || {};
  const collar = animal.collar || {};
  const earTag = animal.ear_tag || {};

  const tempHighlight = noseRing.temperature_c > 39.5;
  const rrHighlight = noseRing.respiratory_rate > 40;
  const chewHighlight = collar.chew_frequency < 40;
  const coughHighlight = collar.cough_count > 2;
  const behaviorHighlight = earTag.behavior_index < 0.4;

  const showSendToVet = animal.current_risk === 'Medium' || animal.current_risk === 'High';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={[styles.heroCard, { borderTopColor: riskColors.bg }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.animalName}>{animal.name}</Text>
              <Text style={styles.animalMeta}>
                {animal.breed || 'Cattle'} · {animal.tag_id}
              </Text>
            </View>
            <RiskBadge level={animal.current_risk} size="lg" />
          </View>
          {animal.current_risk === 'High' && (
            <View style={styles.alertBanner}>
              <Text style={styles.alertBannerText}>
                ⚠ Elevated BRD risk detected — immediate attention recommended
              </Text>
            </View>
          )}
          {animal.current_risk === 'Medium' && (
            <View style={[styles.alertBanner, styles.alertBannerWarn]}>
              <Text style={[styles.alertBannerText, styles.alertBannerTextWarn]}>
                Monitor closely — early BRD indicators present
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>Sensor Readings</Text>

        <SensorCard title="Nose Ring Sensor" icon="🌡️" accentColor="#0ea5e9">
          {noseRing.temperature_c !== undefined && (
            <TelemetryRow
              label="Body Temperature"
              value={Number(noseRing.temperature_c).toFixed(1)}
              unit="°C"
              highlight={tempHighlight}
            />
          )}
          {noseRing.respiratory_rate !== undefined && (
            <TelemetryRow
              label="Respiratory Rate"
              value={Math.round(noseRing.respiratory_rate)}
              unit="breaths/min"
              highlight={rrHighlight}
            />
          )}
        </SensorCard>

        <SensorCard title="Collar Sensor" icon="🔗" accentColor="#16a34a">
          {collar.chew_frequency !== undefined && (
            <TelemetryRow
              label="Chew Frequency"
              value={Math.round(collar.chew_frequency)}
              unit="chews/hr"
              highlight={chewHighlight}
            />
          )}
          {collar.cough_count !== undefined && (
            <TelemetryRow
              label="Cough Count"
              value={Math.round(collar.cough_count)}
              unit="per day"
              highlight={coughHighlight}
            />
          )}
        </SensorCard>

        <SensorCard title="Ear Tag (SenseHub)" icon="🏷️" accentColor="#8b5cf6">
          {earTag.behavior_index !== undefined && (
            <TelemetryRow
              label="Behavior Index"
              value={Number(earTag.behavior_index).toFixed(2)}
              highlight={behaviorHighlight}
            />
          )}
          {earTag.rumination_minutes !== undefined && (
            <TelemetryRow
              label="Rumination"
              value={Math.round(earTag.rumination_minutes)}
              unit="min/day"
            />
          )}
        </SensorCard>

        <View style={styles.thresholdNote}>
          <Text style={styles.thresholdTitle}>Alert Thresholds</Text>
          <Text style={styles.thresholdText}>
            Temp {'>'} 39.5°C · Resp {'>'} 40/min · Chew {'<'} 40/hr · Cough {'>'} 2/day · Behavior {'<'} 0.40
          </Text>
        </View>

        {showSendToVet && (
          <View style={styles.vetSection}>
            <Text style={styles.sectionLabel}>Telehealth</Text>
            <SendToVetButton
              alertId={animal.latest_alert_id}
              animalName={animal.name}
              onSent={handleSent}
              onAiBriefing={handleAiBriefing}
            />
            {aiBriefing && (
              <View style={styles.briefingCard}>
                <View style={styles.briefingHeader}>
                  <Text style={styles.briefingIcon}>🤖</Text>
                  <Text style={styles.briefingTitle}>AI Vet Briefing</Text>
                </View>
                <Text style={styles.briefingText}>{aiBriefing}</Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 20,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderTopWidth: 4,
    padding: 20,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  animalName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  animalMeta: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  alertBanner: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
  },
  alertBannerWarn: {
    backgroundColor: '#fef3c7',
  },
  alertBannerText: {
    fontSize: 15,
    color: '#7f1d1d',
    fontWeight: '600',
    lineHeight: 20,
  },
  alertBannerTextWarn: {
    color: '#78350f',
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
  sensorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    borderLeftWidth: 4,
    gap: 8,
  },
  sensorIcon: {
    fontSize: 20,
  },
  sensorTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  sensorBody: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  thresholdNote: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  thresholdTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  thresholdText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  vetSection: {
    marginTop: 8,
  },
  briefingCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  briefingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  briefingIcon: {
    fontSize: 20,
  },
  briefingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
  },
  briefingText: {
    fontSize: 15,
    color: '#1e3a5f',
    lineHeight: 22,
  },
});

export default CowDetailScreen;
