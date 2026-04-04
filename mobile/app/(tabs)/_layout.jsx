import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

const COLORS = {
  navy: '#0A2547',
  blue: '#006AFF',
  white: '#FFFFFF',
};

export default function TabsLayout() {
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
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Atividades',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="work"
        options={{
          title: 'Trabalho',
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} />,
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
