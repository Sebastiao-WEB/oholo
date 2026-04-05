import AsyncStorage from '@react-native-async-storage/async-storage';

import { SHELL_MODE_STORAGE_KEY } from './shellMode';

const SESSION_USER_ID_KEY = 'oholo_session_user_id';

export async function setSessionUserId(userId) {
  await AsyncStorage.setItem(SESSION_USER_ID_KEY, String(userId));
}

export async function getSessionUserId() {
  const raw = await AsyncStorage.getItem(SESSION_USER_ID_KEY);
  if (raw == null || raw === '') {
    return null;
  }
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export async function clearSession() {
  await AsyncStorage.multiRemove([SESSION_USER_ID_KEY, SHELL_MODE_STORAGE_KEY]);
}
