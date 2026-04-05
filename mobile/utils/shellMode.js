import AsyncStorage from '@react-native-async-storage/async-storage';

export const SHELL_MODE_STORAGE_KEY = 'oholo_shell_mode';

/** @typedef {'customer' | 'provider'} ShellMode */

/** @returns {Promise<ShellMode>} */
export async function readShellMode() {
  const raw = await AsyncStorage.getItem(SHELL_MODE_STORAGE_KEY);
  return raw === 'provider' ? 'provider' : 'customer';
}

/** @param {ShellMode} mode */
export async function writeShellMode(mode) {
  const m = mode === 'provider' ? 'provider' : 'customer';
  await AsyncStorage.setItem(SHELL_MODE_STORAGE_KEY, m);
}
