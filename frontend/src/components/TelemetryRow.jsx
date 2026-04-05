import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TelemetryRow = ({ label, value, unit, highlight = false }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        {highlight && <View style={styles.alertDot} />}
        <Text style={[styles.value, highlight && styles.valueAlert]}>
          {value}
        </Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  label: {
    fontSize: 17,
    color: '#64748b',
    flex: 1,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  valueAlert: {
    color: '#dc2626',
  },
  unit: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 2,
  },
});

export default TelemetryRow;
