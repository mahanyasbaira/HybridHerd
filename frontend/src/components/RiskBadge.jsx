import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getRiskColors } from '../utils/riskColors';

const RiskBadge = ({ level = 'Low', size = 'lg' }) => {
  const colors = getRiskColors(level);

  const isLarge = size === 'lg';
  const paddingHorizontal = isLarge ? 24 : 14;
  const paddingVertical = isLarge ? 12 : 6;
  const fontSize = isLarge ? 20 : 16;

  const styles = StyleSheet.create({
    badge: {
      backgroundColor: colors.bg,
      paddingHorizontal,
      paddingVertical,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: colors.text,
      fontSize,
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{colors.label}</Text>
    </View>
  );
};

export default RiskBadge;
