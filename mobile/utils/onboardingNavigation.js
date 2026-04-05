import { router } from 'expo-router';

import { setOnboardingCompleted } from './onboardingStorage';

/** Marca a onboarding como vista e abre o login (uma vez por instalação). */
export async function goToLoginAfterOnboarding() {
  await setOnboardingCompleted();
  router.replace('/login');
}
