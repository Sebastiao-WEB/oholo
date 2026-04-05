import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#F8FAFD',
  navy: '#0A2547',
  blue: '#006AFF',
  textGray: '#6C7381',
  white: '#FFFFFF',
};

export default function OnboardingStepThreeScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const heroHeight = Math.min(Math.max(height * 0.37, 260), 360);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerRow}>
          <Image source={require('../../assets/img/horizontal-logo.png')} style={styles.horizontalLogo} resizeMode="contain" />
          <Text style={styles.progressText}>3/3</Text>
          <Pressable style={styles.skipTopButton} onPress={() => router.replace('/login')}>
            <Text style={styles.skipTopText}>Pular</Text>
          </Pressable>
        </View>

        <ImageBackground
          source={require('../../assets/img/onboarding/three.jpeg')}
          style={[styles.heroCard, { height: heroHeight }]}
          imageStyle={styles.heroImage}
        />

        <View style={styles.copyArea}>
          <Text style={styles.title}>Compre bilhetes{'\n'}interprovinciais no{'\n'}seu telemóvel</Text>
          <Text style={styles.description}>
            Pesquise viagens, escolha rotas e reserve o seu lugar com mais comodidade e segurança.
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <Pressable style={[styles.actionButton, styles.secondaryButton]} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Anterior</Text>
          </Pressable>

          <Pressable style={[styles.actionButton, styles.primaryButton]} onPress={() => router.replace('/login')}>
            <Text style={styles.primaryButtonText}>Começar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 26,
    minHeight: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  horizontalLogo: {
    width: 112,
    height: 34,
  },
  progressText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.navy,
    marginLeft: 16,
  },
  skipTopButton: {
    minWidth: 84,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7DBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipTopText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F3645',
  },
  heroCard: {
    width: '100%',
    borderRadius: 10,
    marginBottom: 28,
    overflow: 'hidden',
  },
  heroImage: {
    borderRadius: 10,
  },
  copyArea: {
    paddingHorizontal: 2,
    marginBottom: 24,
  },
  title: {
    color: COLORS.navy,
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  description: {
    color: COLORS.textGray,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bottomActions: {
    marginTop: 'auto',
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.navy,
  },
  primaryButton: {
    backgroundColor: COLORS.blue,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
});
