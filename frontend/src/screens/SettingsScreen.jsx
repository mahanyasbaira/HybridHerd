import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const SettingsScreen = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 22,
      color: '#6b7280',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Settings coming soon</Text>
    </SafeAreaView>
  );
};

export default SettingsScreen;
