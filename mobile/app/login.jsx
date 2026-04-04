import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Image source={require('../assets/img/icon.png')} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>Entrar</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Numero de telefone</Text>
            <TextInput
              placeholder="+258 84 000 0000"
              placeholderTextColor="#8A9AB5"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Palavra-passe</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                placeholder="********"
                placeholderTextColor="#8A9AB5"
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={10} style={styles.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#5A6E88" />
              </Pressable>
            </View>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.helperText}>Lembrar-me</Text>
            <Pressable onPress={() => router.push('/forgot-password')}>
              <Text style={styles.linkText}>Esqueci a senha</Text>
            </Pressable>
          </View>

          <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </Pressable>

          <Text style={styles.orText}>Ou entrar com</Text>

          <Pressable style={styles.socialButton}>
            <View style={styles.socialContent}>
              <Image source={require('../assets/img/google.png')} style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Entrar com Google</Text>
            </View>
          </Pressable>

          <Pressable style={styles.socialButton}>
            <View style={styles.socialContent}>
              <Image source={require('../assets/img/facebook.png')} style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Entrar com Facebook</Text>
            </View>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.helperText}>Nao tem conta? </Text>
            <Pressable onPress={() => router.push('/signup')}>
              <Text style={styles.linkText}>Criar conta</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  card: {
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: '#DDE5F0',
  },
  logo: {
    width: 70,
    height: 70,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0A2547',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: '#395271',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D5E6',
    backgroundColor: '#F8FBFF',
    color: '#0A2547',
    paddingHorizontal: 14,
    fontSize: 15,
  },
  inputWithIcon: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D5E6',
    backgroundColor: '#F8FBFF',
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: '#0A2547',
    fontSize: 15,
  },
  eyeButton: {
    padding: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  helperText: {
    fontSize: 16,
    color: '#5A6E88',
  },
  linkText: {
    color: '#48CAE4',
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0A2547',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  orText: {
    color: '#6D829D',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 12,
  },
  socialButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7D5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  socialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  socialIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  socialButtonText: {
    color: '#0A2547',
    fontSize: 15,
    fontWeight: '600',
  },
  footerRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#C3D2E8',
    fontSize: 14,
    textAlign: 'center',
  },
});
