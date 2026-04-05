import { router } from 'expo-router';

/**
 * Abre a área principal.
 * Usa só `replace` — `dismissAll()` (POP_TO_TOP) rebenta no ecrã raiz quando só há um ecrã na pilha.
 */
export function navigateToMainApp() {
  router.replace('/(tabs)');
}
