import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SettingsRow = ({ label, value, valueStyle }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
  </View>
);

const SectionCard = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

const SettingsScreen = () => {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.profileHero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name[0].toUpperCase() : 'R'}
            </Text>
          </View>
          <View>
            <Text style={styles.profileName}>{user?.name || 'Demo Rancher'}</Text>
            <Text style={styles.profileRole}>Rancher · HybridHerd</Text>
          </View>
        </View>

        <SectionCard title="Account">
          <SettingsRow label="Name" value={user?.name || 'Unknown'} />
          <SettingsRow label="Email" value={user?.email || 'Unknown'} />
          <SettingsRow label="Role" value={user?.role || 'Rancher'} valueStyle={styles.roleValue} />
        </SectionCard>

        <SectionCard title="BRD Alert Thresholds">
          <SettingsRow label="Body Temperature" value="> 39.5°C" />
          <SettingsRow label="Respiratory Rate" value="> 40 breaths/min" />
          <SettingsRow label="Chew Frequency" value="< 40 chews/hr" />
          <SettingsRow label="Cough Count" value="> 2 per day" />
          <SettingsRow label="Behavior Index" value="< 0.40" />
          <Text style={styles.noteText}>Thresholds are configured on the server</Text>
        </SectionCard>

        <SectionCard title="App Info">
          <SettingsRow label="Version" value="1.0.0" />
          <SettingsRow label="Backend" value="localhost:4000" />
          <SettingsRow label="ML Service" value="localhost:8000" />
          <SettingsRow label="AI Model" value="Gemini 1.5 Flash" />
        </SectionCard>

        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={logout}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowLabel: {
    fontSize: 17,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
  },
  rowValue: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 12,
  },
  roleValue: {
    color: '#16a34a',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  noteText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingBottom: 14,
    paddingTop: 4,
  },
  signOutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default SettingsScreen;
