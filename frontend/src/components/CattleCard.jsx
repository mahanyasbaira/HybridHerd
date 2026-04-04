import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import RiskBadge from './RiskBadge';

const CattleCard = ({ animal, onPress }) => {
  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 4,
      padding: 16,
      marginBottom: 12,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      minHeight: 80,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 4,
    },
    leftContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    cowIcon: {
      fontSize: 40,
      marginRight: 16,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#f3f4f6',
      textAlign: 'center',
      lineHeight: 48,
    },
    textContainer: {
      flex: 1,
    },
    name: {
      fontSize: 24,
      fontWeight: '700',
      color: '#000000',
      marginBottom: 4,
    },
    tagId: {
      fontSize: 16,
      color: '#9ca3af',
    },
  });

  return (
    <Pressable
      onPress={onPress}
      activeOpacity={0.7}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.leftContainer}>
        <Text style={styles.cowIcon}>🐄</Text>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{animal.name}</Text>
          <Text style={styles.tagId}>{animal.tag_id}</Text>
        </View>
      </View>
      <RiskBadge level={animal.current_risk} />
    </Pressable>
  );
};

export default CattleCard;
