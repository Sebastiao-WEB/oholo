import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Image source={require('../assets/img/icon.png')} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>Recuperar palavra-passe</Text>
          <Text style={styles.subtitle}>
            Informe o seu numero de telefone para enviarmos um codigo de verificacao.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Numero de telefone</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="call-outline" size={18} color="#5A6E88" style={styles.leftIcon} />
              <TextInput
                placeholder="+258 84 000 0000"
                placeholderTextColor="#8A9AB5"
                style={styles.input}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <Pressable style={styles.primaryButton} onPress={() => router.push('/otp')}>
            <Text style={styles.primaryButtonText}>Enviar codigo</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </Pressable>
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
    fontSize: 30,
    fontWeight: '800',
    color: '#0A2547',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#5A6E88',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#395271',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#0A2547',
    fontSize: 15,
  },
  inputWithIcon: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D5E6',
    backgroundColor: '#F8FBFF',
    paddingLeft: 12,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0A2547',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#0A2547',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#0A2547',
    fontSize: 16,
    fontWeight: '700',
  },
});
