import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MENU = [
  { key: 'account', title: 'Dados pessoais', icon: 'person-outline', chevron: true },
  { key: 'payments', title: 'Métodos de pagamento', icon: 'wallet-outline', chevron: true },
  { key: 'notifications', title: 'Notificações', icon: 'notifications-outline', chevron: true },
  { key: 'help', title: 'Centro de ajuda', icon: 'help-circle-outline', chevron: true },
  { key: 'terms', title: 'Termos e privacidade', icon: 'document-text-outline', chevron: true },
];

export default function ProfileTabScreen() {
  const router = useRouter();

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
      { text: 'Sair', style: 'destructive', onPress: () => router.replace('/login') },
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
          <Image source={require('../../assets/img/avatar.png')} style={styles.avatar} />
          <View style={styles.profileText}>
            <Text style={styles.name}>Cleiton Manuel</Text>
            <Text style={styles.phone}>+258 84 123 4567</Text>
            <View style={styles.pill}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#1B7A4C" />
              <Text style={styles.pillText}>Conta verificada</Text>
            </View>
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
