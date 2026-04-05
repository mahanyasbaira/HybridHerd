import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import RiskBadge from './RiskBadge';
import { getRiskColors } from '../utils/riskColors';

const CattleCard = ({ animal, onPress }) => {
  const colors = getRiskColors(animal.current_risk);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.riskAccent, { backgroundColor: colors.bg }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.nameBlock}>
            <Text style={styles.name}>{animal.name}</Text>
            <Text style={styles.meta}>
              {animal.breed || 'Cattle'} · {animal.tag_id}
            </Text>
          </View>
          <RiskBadge level={animal.current_risk} size="sm" />
        </View>
        {animal.nose_ring?.temperature_c !== undefined && (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Temp</Text>
              <Text
                style={[
                  styles.statValue,
                  animal.nose_ring.temperature_c > 39.5 && styles.statAlert,
                ]}
              >
                {Number(animal.nose_ring.temperature_c).toFixed(1)}°C
              </Text>
            </View>
            {animal.nose_ring?.respiratory_rate !== undefined && (
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Resp Rate</Text>
                <Text
                  style={[
                    styles.statValue,
                    animal.nose_ring.respiratory_rate > 40 && styles.statAlert,
                  ]}
                >
                  {Math.round(animal.nose_ring.respiratory_rate)} /min
                </Text>
              </View>
            )}
            {animal.ear_tag?.behavior_index !== undefined && (
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Behavior</Text>
                <Text
                  style={[
                    styles.statValue,
                    animal.ear_tag.behavior_index < 0.4 && styles.statAlert,
                  ]}
                >
                  {Number(animal.ear_tag.behavior_index).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      <View style={styles.chevronContainer}>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.85,
    shadowOpacity: 0.04,
  },
  riskAccent: {
    width: 6,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  nameBlock: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  meta: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  statAlert: {
    color: '#dc2626',
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingRight: 14,
  },
  chevron: {
    fontSize: 28,
    color: '#cbd5e1',
    fontWeight: '300',
    lineHeight: 30,
  },
});

export default CattleCard;
