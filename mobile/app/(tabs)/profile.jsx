import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useShellMode } from '../../contexts/ShellModeContext';
import { getFirstSync, initLocalDatabase } from '../../db';
import { formatPhoneForDisplay } from '../../utils/formatPhone';
import { avatarFileExists } from '../../utils/profileAvatar';
import { clearSession, getSessionUserId } from '../../utils/session';

const MENU = [
  { key: 'account', title: 'Dados pessoais', icon: 'person-outline', chevron: true },
  { key: 'payments', title: 'Métodos de pagamento', icon: 'wallet-outline', chevron: true },
  { key: 'notifications', title: 'Notificações', icon: 'notifications-outline', chevron: true },
  { key: 'help', title: 'Centro de ajuda', icon: 'help-circle-outline', chevron: true },
  { key: 'terms', title: 'Termos e privacidade', icon: 'document-text-outline', chevron: true },
];

export default function ProfileTabScreen() {
  const router = useRouter();
  const { mode, setMode } = useShellMode();
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAvatarUri, setProfileAvatarUri] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          initLocalDatabase();
          const userId = await getSessionUserId();
          if (!active) {
            return;
          }
          if (userId == null) {
            setProfileName('');
            setProfilePhone('');
            setProfileAvatarUri(null);
            return;
          }
          const row = getFirstSync('SELECT name, phone, avatar_uri FROM users WHERE id = ?', [userId]);
          if (!active) {
            return;
          }
          if (row) {
            setProfileName(String(row.name || '').trim() || '—');
            setProfilePhone(formatPhoneForDisplay(row.phone) || '—');
            let av = row.avatar_uri ? String(row.avatar_uri).trim() : '';
            if (av && !(await avatarFileExists(av))) {
              av = '';
            }
            setProfileAvatarUri(av || null);
          } else {
            setProfileName('');
            setProfilePhone('');
            setProfileAvatarUri(null);
          }
        } catch (e) {
          console.error(e);
          if (active) {
            setProfileName('');
            setProfilePhone('');
            setProfileAvatarUri(null);
          }
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const onMenuItem = (key) => {
    if (key === 'account') {
      router.push('/personal-data');
      return;
    }
    if (key === 'terms') {
      Alert.alert('Oholo', 'Os termos e a política de privacidade estarão disponíveis aqui em breve.');
      return;
    }
    Alert.alert('Oholo', 'Esta secção será ligada à sua conta quando o backend estiver disponível.');
  };

  const onLogout = () => {
    Alert.alert('Terminar sessão', 'Deseja sair da aplicação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/(tabs)')} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenSubtitle}>Gerir a sua conta Oholo</Text>

        <View style={styles.profileCard}>
          <Image
            source={profileAvatarUri ? { uri: profileAvatarUri } : require('../../assets/img/avatar.png')}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.profileText}>
            <Text style={styles.name}>{profileName || '—'}</Text>
            <Text style={styles.phone}>{profilePhone || '—'}</Text>
            <View style={styles.pill}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#1B7A4C" />
              <Text style={styles.pillText}>Conta verificada</Text>
            </View>
            {mode === 'provider' ? (
              <View style={[styles.pill, styles.pillProvider]}>
                <Ionicons name="briefcase-outline" size={14} color="#006AFF" />
                <Text style={styles.pillTextProvider}>Modo prestador</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Experiência na app</Text>
        <View style={styles.modeCard}>
          <View style={styles.modeRow}>
            <View style={styles.modeIconWrap}>
              <Ionicons name="swap-horizontal-outline" size={22} color="#0A2547" />
            </View>
            <View style={styles.modeCopy}>
              <Text style={styles.modeTitle}>Modo prestador</Text>
              <Text style={styles.modeSub}>
                Activo: menu com Painel, Corridas e Delivery para quem trabalha com a Oholo. Desligado: vista de cliente
                (Início, Atividades, Trabalho).
              </Text>
            </View>
            <Switch
              value={mode === 'provider'}
              onValueChange={(v) => {
                void (async () => {
                  await setMode(v ? 'provider' : 'customer');
                  router.replace('/(tabs)');
                })();
              }}
              trackColor={{ false: '#D4DEEA', true: '#8EB8FF' }}
              thumbColor={mode === 'provider' ? '#006AFF' : '#F4F6FA'}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Conta</Text>
        <View style={styles.menuCard}>
          {MENU.map((item, index) => (
            <Pressable
              key={item.key}
              style={[styles.menuRow, index < MENU.length - 1 && styles.menuRowBorder]}
              onPress={() => onMenuItem(item.key)}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={22} color="#0A2547" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              {item.chevron ? <Ionicons name="chevron-forward" size={20} color="#B8C4D6" /> : null}
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.logoutRow} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={22} color="#C0392B" />
          <Text style={styles.logoutText}>Terminar sessão</Text>
        </Pressable>

        <Text style={styles.version}>Oholo · versão piloto</Text>
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
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
  },
  screenSubtitle: {
    fontSize: 15,
    color: '#6C7B90',
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E3EAF4',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#D9E4F2',
    backgroundColor: '#E5EAF2',
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A2547',
  },
  phone: {
    marginTop: 4,
    fontSize: 14,
    color: '#51627B',
  },
  pill: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E6F7EF',
    borderWidth: 1,
    borderColor: '#B8E5CC',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1B7A4C',
  },
  pillProvider: {
    marginTop: 8,
    backgroundColor: '#EAF4FF',
    borderColor: '#B8D4FF',
  },
  pillTextProvider: {
    fontSize: 12,
    fontWeight: '800',
    color: '#006AFF',
  },
  modeCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E8F2',
    padding: 14,
    marginBottom: 4,
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCopy: { flex: 1, minWidth: 0 },
  modeTitle: { fontSize: 16, fontWeight: '800', color: '#0A2547' },
  modeSub: { marginTop: 4, fontSize: 13, color: '#51627B', lineHeight: 18 },
  sectionLabel: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#63758F',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  menuCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E8F2',
    overflow: 'hidden',
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2F47',
  },
  logoutRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#C0392B',
  },
  version: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    color: '#9AA8BC',
  },
});
