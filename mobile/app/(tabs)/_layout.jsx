import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useShellMode } from '../../contexts/ShellModeContext';

const COLORS = {
  navy: '#0A2547',
  blue: '#006AFF',
  white: '#FFFFFF',
};

export default function TabsLayout() {
  const { mode, ready } = useShellMode();
  const isProvider = ready && mode === 'provider';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.blue,
        tabBarInactiveTintColor: '#D7E3F2',
        tabBarIconStyle: {
          marginBottom: -2,
        },
        tabBarStyle: {
          backgroundColor: COLORS.navy,
          borderTopWidth: 0,
          height: 56,
          paddingBottom: 4,
          paddingTop: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isProvider ? 'Painel' : 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isProvider ? 'speedometer-outline' : 'home'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Atividades',
          href: isProvider ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="work"
        options={{
          title: 'Trabalho',
          href: isProvider ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="provider-rides"
        options={{
          title: 'Corridas',
          href: isProvider ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="car-sport-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="provider-delivery"
        options={{
          title: 'Delivery',
          href: isProvider ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="bicycle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
