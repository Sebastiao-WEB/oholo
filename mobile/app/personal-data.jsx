import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
  passwordMatchesStored,
  phoneToStoredE164,
  validateFullName,
  validatePasswordLength,
} from '../utils/authLocal';
import { formatPhoneForDisplay } from '../utils/formatPhone';
import {
  avatarFileExists,
  copyPickedAvatarToPersistent,
  deleteLocalAvatarFile,
} from '../utils/profileAvatar';
import { getSessionUserId } from '../utils/session';

const defaultAvatar = require('../assets/img/avatar.png');

export default function PersonalDataScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [storedAvatarUri, setStoredAvatarUri] = useState(null);
  const [pickedUri, setPickedUri] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      initLocalDatabase();
      const userId = await getSessionUserId();
      if (userId == null) {
        Alert.alert('Sessão', 'Inicie sessão para gerir os seus dados.', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
        return;
      }
      const row = getFirstSync(
        'SELECT id, name, phone, avatar_uri FROM users WHERE id = ?',
        [userId]
      );
      if (!row) {
        Alert.alert('Oholo', 'Utilizador não encontrado.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }
      setFullName(String(row.name || '').trim());
      setPhoneDisplay(formatPhoneForDisplay(row.phone) || '');
      let uri = row.avatar_uri ? String(row.avatar_uri).trim() : '';
      if (uri && !(await avatarFileExists(uri))) {
        uri = '';
      }
      setStoredAvatarUri(uri || null);
      setPickedUri(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      void loadUser();
    }, [loadUser])
  );

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
      setPickedUri(result.assets[0].uri);
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
      setPickedUri(result.assets[0].uri);
    }
  }, []);

  const openPhotoOptions = useCallback(() => {
    Alert.alert('Foto de perfil', 'Como deseja atualizar a foto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Galeria', onPress: () => void pickFromLibrary() },
      { text: 'Câmara', onPress: () => void pickFromCamera() },
    ]);
  }, [pickFromLibrary, pickFromCamera]);

  const onSave = useCallback(async () => {
    const nameTrim = fullName.trim().replace(/\s+/g, ' ');
    if (!validateFullName(nameTrim)) {
      Alert.alert(
        'Nome inválido',
        'Use apenas letras, espaços, hífen ou apóstrofo. Não utilize números nem símbolos como @ ou #.'
      );
      return;
    }

    const national = normalizeMozPhoneDigits(phoneDisplay);
    if (!national || !isValidMozPhone9(national)) {
      Alert.alert(
        'Telefone inválido',
        'Indique 9 dígitos com prefixo 82, 83, 84, 85, 86 ou 87 (ex.: 84 000 0000 ou +258 84 000 0000).'
      );
      return;
    }

    const wantsPwChange = newPassword.length > 0 || confirmNewPassword.length > 0;

    if (currentPassword.length > 0 && !wantsPwChange) {
      Alert.alert(
        'Palavra-passe',
        'Indique a nova palavra-passe e a confirmação, ou limpe o campo da palavra-passe atual.'
      );
      return;
    }

    if (wantsPwChange) {
      if (!validatePasswordLength(newPassword)) {
        Alert.alert('Oholo', 'A nova palavra-passe deve ter pelo menos 6 caracteres.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        Alert.alert('Oholo', 'A nova palavra-passe e a confirmação não coincidem.');
        return;
      }
      if (!validatePasswordLength(currentPassword)) {
        Alert.alert(
          'Palavra-passe atual',
          'Para alterar a palavra-passe, indique primeiro a palavra-passe atual.'
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      initLocalDatabase();
      const userId = await getSessionUserId();
      if (userId == null) {
        Alert.alert('Sessão', 'Inicie sessão novamente.');
        router.replace('/login');
        return;
      }

      const row = getFirstSync('SELECT phone, password, avatar_uri FROM users WHERE id = ?', [
        userId,
      ]);
      if (!row) {
        Alert.alert('Oholo', 'Utilizador não encontrado.');
        return;
      }

      const newPhoneE164 = phoneToStoredE164(national);
      if (newPhoneE164 !== row.phone) {
        const other = getFirstSync('SELECT id FROM users WHERE phone = ? AND id != ?', [
          newPhoneE164,
          userId,
        ]);
        if (other) {
          Alert.alert('Telefone', 'Já existe outra conta com este número.');
          return;
        }
      }

      let passwordToStore = row.password;
      if (wantsPwChange) {
        if (!(await passwordMatchesStored(currentPassword, row.password))) {
          Alert.alert('Palavra-passe', 'A palavra-passe atual não está correta.');
          return;
        }
        passwordToStore = await hashPasswordForStorage(newPassword);
      }

      let avatarUriToStore = row.avatar_uri ? String(row.avatar_uri) : null;
      if (pickedUri) {
        const previous = avatarUriToStore;
        avatarUriToStore = await copyPickedAvatarToPersistent(pickedUri, userId);
        if (previous && previous !== avatarUriToStore) {
          await deleteLocalAvatarFile(previous);
        }
      }

      runSync(
        `UPDATE users SET name = ?, phone = ?, password = ?, avatar_uri = ?, updated_at = datetime('now') WHERE id = ?`,
        [nameTrim, newPhoneE164, passwordToStore, avatarUriToStore, userId]
      );

      setStoredAvatarUri(avatarUriToStore);
      setPickedUri(null);
      setPhoneDisplay(formatPhoneForDisplay(newPhoneE164));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      Alert.alert('Oholo', 'Dados guardados neste dispositivo.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível guardar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }, [
    fullName,
    phoneDisplay,
    currentPassword,
    newPassword,
    confirmNewPassword,
    pickedUri,
    router,
  ]);

  const displayAvatar = pickedUri || storedAvatarUri;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Dados pessoais</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#006AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Dados pessoais</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.lead}>
          Os dados vêm da sua conta. A foto é guardada neste dispositivo; em produção poderá sincronizar com o
          servidor.
        </Text>

        <View style={styles.avatarBlock}>
          <Pressable onPress={openPhotoOptions} style={styles.avatarPress}>
            <Image
              source={displayAvatar ? { uri: displayAvatar } : defaultAvatar}
              style={styles.avatar}
              resizeMode="cover"
            />
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
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de telefone</Text>
            <TextInput
              value={phoneDisplay}
              onChangeText={setPhoneDisplay}
              placeholder="+258 84 000 0000"
              placeholderTextColor="#8A9AB5"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.sectionTitle}>Palavra-passe</Text>
          <Text style={styles.hint}>
            Para alterar a palavra-passe, indique a atual e a nova. Deixe todos os campos em branco para manter a
            palavra-passe atual.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Palavra-passe atual</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Obrigatória se alterar a palavra-passe"
                placeholderTextColor="#8A9AB5"
                style={styles.passwordInput}
                secureTextEntry={!showCurrentPassword}
              />
              <Pressable onPress={() => setShowCurrentPassword((p) => !p)} hitSlop={10} style={styles.eyeButton}>
                <Ionicons
                  name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#5A6E88"
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nova palavra-passe</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#8A9AB5"
                style={styles.passwordInput}
                secureTextEntry={!showNewPassword}
              />
              <Pressable onPress={() => setShowNewPassword((p) => !p)} hitSlop={10} style={styles.eyeButton}>
                <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#5A6E88" />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmar nova palavra-passe</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Repita a nova palavra-passe"
                placeholderTextColor="#8A9AB5"
                style={styles.passwordInput}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPassword((p) => !p)} hitSlop={10} style={styles.eyeButton}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#5A6E88"
                />
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
          onPress={() => void onSave()}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Guardar alterações</Text>
          )}
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
  loadingWrap: {
    flex: 1,
    backgroundColor: '#F6F8FC',
    alignItems: 'center',
    justifyContent: 'center',
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
  primaryButtonDisabled: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
