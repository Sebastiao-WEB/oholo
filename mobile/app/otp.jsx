import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OtpScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleChange = (value, index) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Image source={require('../assets/img/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Confirmar OTP</Text>
          <Text style={styles.subtitle}>Insira o codigo enviado para o seu email ou telefone.</Text>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={styles.otpCell}
                value={digit}
                onChangeText={(value) => handleChange(value, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectionColor="#0A2547"
              />
            ))}
          </View>

          <Pressable style={styles.primaryButton} onPress={() => router.push('/reset-password')}>
            <Text style={styles.primaryButtonText}>Continuar</Text>
          </Pressable>

          <Pressable>
            <Text style={styles.linkText}>Reenviar OTP</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => router.replace('/login')}>
            <Text style={styles.secondaryButtonText}>Voltar ao login</Text>
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
    alignItems: 'center',
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
    marginBottom: 8,
  },
  subtitle: {
    color: '#5A6E88',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  otpCell: {
    width: 46,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#C7D5E6',
    color: '#0A2547',
    fontSize: 20,
    fontWeight: '700',
  },
  primaryButton: {
    width: '100%',
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
  linkText: {
    color: '#48CAE4',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 18,
  },
  secondaryButton: {
    width: '100%',
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
