import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import { sendToVet } from '../utils/api';

const SendToVetButton = ({ alertId, animalName, onSent, onAiBriefing }) => {
  const [loading, setLoading] = useState(false);

  const handlePress = () => {
    Alert.prompt(
      `Send ${animalName} to Vet`,
      'Add notes for the veterinarian:',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Send',
          onPress: async (note) => {
            if (!note || note.trim().length === 0) {
              Alert.alert('Error', 'Please add a note before sending.');
              return;
            }

            setLoading(true);
            try {
              const response = await sendToVet(alertId, note.trim());
              Alert.alert('Success', 'Alert sent to veterinarian.');
              if (response.ai_briefing && onAiBriefing) {
                onAiBriefing(response.ai_briefing);
              }
              onSent();
            } catch (error) {
              Alert.alert('Error', 'Failed to send alert. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const styles = StyleSheet.create({
    button: {
      backgroundColor: '#dc2626',
      paddingVertical: 18,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginHorizontal: 16,
      marginVertical: 16,
      minHeight: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonPressed: {
      opacity: 0.9,
    },
    text: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: '700',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        loading && { opacity: 0.7 },
      ]}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#ffffff" />
          <Text style={[styles.text, { marginLeft: 8 }]}>Sending...</Text>
        </View>
      ) : (
        <Text style={styles.text}>Send to Vet</Text>
      )}
    </Pressable>
  );
};

export default SendToVetButton;
