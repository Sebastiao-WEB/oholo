import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const defaultAvatar = require('../assets/img/avatar.png');

export default function PersonalDataScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Cleiton Manuel');
  const [phone, setPhone] = useState('+258 84 123 4567');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);

  const pickFromLibrary = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Oholo', 'Precisamos de permissão para aceder à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Oholo', 'Precisamos de permissão para usar a câmara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  const openPhotoOptions = useCallback(() => {
    Alert.alert('Foto de perfil', 'Como deseja atualizar a foto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Galeria', onPress: () => void pickFromLibrary() },
      { text: 'Câmara', onPress: () => void pickFromCamera() },
    ]);
  }, [pickFromLibrary, pickFromCamera]);

  const onSave = useCallback(() => {
    const nameOk = fullName.trim().length >= 2;
    const phoneOk = phone.replace(/\s/g, '').length >= 9;
    if (!nameOk) {
      Alert.alert('Oholo', 'Indique o seu nome completo.');
      return;
    }
    if (!phoneOk) {
      Alert.alert('Oholo', 'Indique um número de telefone válido.');
      return;
    }
    if (password.length > 0 || confirmPassword.length > 0) {
      if (password.length < 6) {
        Alert.alert('Oholo', 'A nova palavra-passe deve ter pelo menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Oholo', 'As palavras-passe não coincidem.');
        return;
      }
    }
    Alert.alert('Oholo', 'Dados guardados localmente. Em produção, serão sincronizados com o servidor.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [fullName, phone, password, confirmPassword, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Dados pessoais</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.lead}>Atualize os dados da sua conta. A foto e as alterações ficam neste dispositivo até existir API.</Text>

        <View style={styles.avatarBlock}>
          <Pressable onPress={openPhotoOptions} style={styles.avatarPress}>
            <Image source={avatarUri ? { uri: avatarUri } : defaultAvatar} style={styles.avatar} />
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </View>
          </Pressable>
          <Pressable onPress={openPhotoOptions} hitSlop={8}>
            <Text style={styles.changePhotoText}>Alterar foto de perfil</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados do cadastro</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome completo</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="O seu nome completo"
              placeholderTextColor="#8A9AB5"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de telefone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+258 84 000 0000"
              placeholderTextColor="#8A9AB5"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.sectionTitle}>Palavra-passe</Text>
          <Text style={styles.hint}>Deixe em branco para manter a palavra-passe atual.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nova palavra-passe</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                placeholderTextColor="#8A9AB5"
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword((p) => !p)} hitSlop={10} style={styles.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#5A6E88" />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmar nova palavra-passe</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="********"
                placeholderTextColor="#8A9AB5"
                style={styles.passwordInput}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPassword((p) => !p)} hitSlop={10} style={styles.eyeButton}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#5A6E88" />
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={onSave}>
          <Text style={styles.primaryButtonText}>Guardar alterações</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A2547',
  },
  header: {
    height: 56,
    backgroundColor: '#0A2547',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 26,
  },
  body: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  lead: {
    fontSize: 14,
    color: '#51627B',
    lineHeight: 20,
    marginBottom: 18,
  },
  avatarBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPress: {
    position: 'relative',
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5EAF2',
  },
  avatarEditBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#006AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  changePhotoText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#006AFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3EAF4',
    marginBottom: 16,
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A2547',
    marginBottom: 10,
    marginTop: 4,
  },
  hint: {
    fontSize: 13,
    color: '#63758F',
    marginBottom: 12,
    marginTop: -4,
    lineHeight: 18,
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
    backgroundColor: '#006AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
