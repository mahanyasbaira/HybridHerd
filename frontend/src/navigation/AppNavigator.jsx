import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import DashboardScreen from '../screens/DashboardScreen';
import CowDetailScreen from '../screens/CowDetailScreen';
import AlertsScreen from '../screens/AlertsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { fetchAlerts } from '../utils/api';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HerdStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="CowDetail" component={CowDetailScreen} />
  </Stack.Navigator>
);

const AlertsBadge = () => {
  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    refetchInterval: 30000,
  });

  return alerts.length > 0 ? alerts.length : null;
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1f2937',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
        tabBarStyle: {
          height: 60,
          paddingVertical: 8,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
      })}
    >
      <Tab.Screen
        name="Herd"
        component={HerdStack}
        options={{
          tabBarLabel: 'Herd',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🐄</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🔔</Text>
          ),
          tabBarBadge: <AlertsBadge />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
