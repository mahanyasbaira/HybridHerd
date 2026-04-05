import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getRiskColors } from '../utils/riskColors';

const RiskBadge = ({ level = 'Low', size = 'md' }) => {
  const colors = getRiskColors(level);

  const sizeStyles = {
    sm: { px: 10, py: 4, fontSize: 13 },
    md: { px: 14, py: 6, fontSize: 15 },
    lg: { px: 20, py: 10, fontSize: 18 },
  }[size] || { px: 14, py: 6, fontSize: 15 };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingHorizontal: sizeStyles.px,
          paddingVertical: sizeStyles.py,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: sizeStyles.fontSize }]}>
        {colors.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default RiskBadge;
