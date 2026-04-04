import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TelemetryRow = ({ label, value, unit, highlight = false }) => {
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    },
    labelContainer: {
      flex: 1,
    },
    label: {
      fontSize: 18,
      color: '#9ca3af',
    },
    valueContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginLeft: 16,
    },
    value: {
      fontSize: 22,
      fontWeight: '700',
      color: highlight ? '#dc2626' : '#000000',
    },
    unit: {
      fontSize: 16,
      color: '#9ca3af',
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
};

export default TelemetryRow;
