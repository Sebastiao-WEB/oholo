import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getFirstSync, initLocalDatabase, runSync } from '../db';
import {
  hashPasswordForStorage,
  isValidMozPhone9,
  normalizeMozPhoneDigits,
  phoneToStoredE164,
  validateFullName,
  validatePasswordLength,
} from '../utils/authLocal';

function showFeatureInDevelopmentAlert() {
  Alert.alert('Em desenvolvimento', 'Esta funcionalidade ainda está em desenvolvimento.');
}

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCreateAccount = async () => {
    const nameTrim = name.trim().replace(/\s+/g, ' ');
    if (!validateFullName(nameTrim)) {
      Alert.alert(
        'Nome inválido',
        'Use apenas letras, espaços, hífen ou apóstrofo. Não utilize números nem símbolos como @ ou #.'
      );
      return;
    }

    const national = normalizeMozPhoneDigits(phone);
    if (!national || !isValidMozPhone9(national)) {
      Alert.alert(
        'Telefone inválido',
        'Indique 9 dígitos com prefixo 82, 83, 84, 85, 86 ou 87 (ex.: 84 000 0000 ou +258 84 000 0000).'
      );
      return;
    }

    if (!validatePasswordLength(password)) {
      Alert.alert('Palavra-passe', 'A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Palavra-passe', 'A confirmação tem de ser igual à palavra-passe.');
      return;
    }

    setSubmitting(true);
    try {
      initLocalDatabase();
      const phoneStored = phoneToStoredE164(national);
      const existing = getFirstSync('SELECT id FROM users WHERE phone = ?', [phoneStored]);
      if (existing) {
        Alert.alert('Conta existente', 'Já existe uma conta com este número de telefone.');
        return;
      }

      const passwordHash = await hashPasswordForStorage(password);
      runSync(
        `INSERT INTO users (name, phone, email, password, status, is_admin)
         VALUES (?, ?, NULL, ?, 'active', 0)`,
        [nameTrim, phoneStored, passwordHash]
      );

      Alert.alert('Conta criada', 'Pode iniciar sessão com o seu telefone e palavra-passe.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível guardar a conta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Image source={require('../assets/img/icon.png')} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>Criar conta</Text>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={18} color="#395271" />
              <Text style={styles.inputLabel}>Nome completo</Text>
            </View>
            <TextInput
              placeholder="O seu nome completo"
              placeholderTextColor="#8A9AB5"
              style={styles.input}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="call-outline" size={18} color="#395271" />
              <Text style={styles.inputLabel}>Telefone</Text>
            </View>
            <TextInput
              placeholder="+258 84 000 0000"
              placeholderTextColor="#8A9AB5"
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#395271" />
              <Text style={styles.inputLabel}>Palavra-passe</Text>
            </View>
            <View style={styles.inputWithIcon}>
              <TextInput
                placeholder="********"
                placeholderTextColor="#8A9AB5"
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={10} style={styles.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#5A6E88" />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#395271" />
              <Text style={styles.inputLabel}>Confirmar palavra-passe</Text>
            </View>
            <View style={styles.inputWithIcon}>
              <TextInput
                placeholder="********"
                placeholderTextColor="#8A9AB5"
                style={styles.passwordInput}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPassword((prev) => !prev)} hitSlop={10} style={styles.eyeButton}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#5A6E88" />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
            onPress={handleCreateAccount}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Criar conta</Text>
            )}
          </Pressable>

          <View style={styles.orDividerRow}>
            <View style={styles.orLine} />
            <Text style={styles.orLabel}>Ou criar com</Text>
            <View style={styles.orLine} />
          </View>

          <Pressable style={styles.socialButton} onPress={showFeatureInDevelopmentAlert}>
            <View style={styles.socialContent}>
              <Image source={require('../assets/img/google.png')} style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Criar com Google</Text>
            </View>
          </Pressable>

          <Pressable style={styles.socialButton} onPress={showFeatureInDevelopmentAlert}>
            <View style={styles.socialContent}>
              <Image source={require('../assets/img/facebook.png')} style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Criar com Facebook</Text>
            </View>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.helperText}>Já tem conta? </Text>
            <Pressable onPress={() => router.replace('/login')}>
              <Text style={styles.linkText}>Entrar</Text>
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  inputLabel: {
    color: '#395271',
    fontSize: 14,
  },
  input: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D5E6',
    backgroundColor: '#F8FBFF',
    color: '#0A2547',
    paddingHorizontal: 14,
    fontSize: 15,
  },
  inputWithIcon: {
    height: 50,
    borderRadius: 10,
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
  primaryButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#0A2547',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    color: '#5A6E88',
    fontSize: 14,
  },
  linkText: {
    color: '#48CAE4',
    fontWeight: '700',
    fontSize: 14,
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#C7D5E6',
  },
  orLabel: {
    paddingHorizontal: 12,
    color: '#6D829D',
    fontSize: 14,
    fontWeight: '500',
  },
  socialButton: {
    height: 48,
    borderRadius: 10,
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
});
