import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { getFirstSync, initLocalDatabase } from '../db';
import { isOnboardingCompleted } from '../utils/onboardingStorage';
import { clearSession, getSessionUserId } from '../utils/session';

const COLORS = {
  navy: '#0A2547',
  blue: '#006AFF',
  cyan: '#48CAE4',
  white: '#FFFFFF',
};

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        const done = await isOnboardingCompleted();
        if (!done) {
          router.replace('/onboarding/step-1');
          return;
        }

        try {
          initLocalDatabase();
        } catch (e) {
          console.error('[splash]', e);
        }

        const userId = await getSessionUserId();
        if (userId != null) {
          try {
            const row = getFirstSync('SELECT id FROM users WHERE id = ?', [userId]);
            if (row) {
              router.replace('/(tabs)');
              return;
            }
          } catch (e) {
            console.error('[splash] sessão', e);
          }
          await clearSession();
        }

        router.replace('/login');
      })();
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.layerTopLeft} />
      <View style={styles.layerCenterRight} />
      <View style={styles.layerBottom} />
      <View style={[styles.spark, styles.sparkLeft]} />
      <View style={[styles.spark, styles.sparkRight]} />

      <View style={styles.brandArea}>
        <Image source={require('../assets/img/icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Oholo</Text>
      </View>

      <View style={styles.footerTextArea}>
        <Text style={styles.tagline}>Mobilidade & Logistica</Text>
        <Text style={styles.subTagline}>De Nampula para Mocambique</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  layerTopLeft: {
    position: 'absolute',
    top: -160,
    left: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: '#061B38',
  },
  layerCenterRight: {
    position: 'absolute',
    top: 100,
    right: -150,
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: '#006AFF66',
  },
  layerBottom: {
    position: 'absolute',
    bottom: -180,
    right: -80,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: '#48CAE47A',
  },
  spark: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#48CAE466',
  },
  sparkLeft: {
    left: 30,
    bottom: 165,
  },
  sparkRight: {
    right: 22,
    top: 300,
  },
  brandArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 10,
  },
  title: {
    color: COLORS.white,
    fontSize: 66,
    fontWeight: '700',
    letterSpacing: 0.2,
    textShadowColor: '#02132980',
    textShadowRadius: 5,
    textShadowOffset: { width: 0, height: 2 },
  },
  footerTextArea: {
    position: 'absolute',
    bottom: 72,
    alignItems: 'center',
  },
  tagline: {
    color: '#EAF4FF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subTagline: {
    color: '#D8ECFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
