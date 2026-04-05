import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { ShellModeProvider } from '../contexts/ShellModeContext';
import { initLocalDatabase } from '../db';

export default function RootLayout() {
  useEffect(() => {
    try {
      initLocalDatabase();
    } catch (e) {
      console.error('[oholo] SQLite local:', e);
    }
  }, []);

  return (
    <ShellModeProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ride-in-progress"
        options={{ gestureEnabled: false, fullScreenGestureEnabled: false }}
      />
      <Stack.Screen
        name="delivery-courier-pickup"
        options={{ gestureEnabled: false, fullScreenGestureEnabled: false }}
      />
    </Stack>
    </ShellModeProvider>
  );
}
