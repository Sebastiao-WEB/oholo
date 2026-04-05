import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'oholo_onboarding_concluido_v1';

export async function isOnboardingCompleted() {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === '1';
  } catch {
    return false;
  }
}

export async function setOnboardingCompleted() {
  try {
    await AsyncStorage.setItem(KEY, '1');
  } catch (e) {
    console.warn('[onboarding] não foi possível gravar estado:', e);
  }
}
