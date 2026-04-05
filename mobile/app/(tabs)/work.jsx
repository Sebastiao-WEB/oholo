import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProviderProfileForUser, initLocalDatabase } from '../../db';
import { getSessionUserId } from '../../utils/session';

const OPTIONS = [
  {
    key: 'driver',
    title: 'Quero ser motorista parceiro',
    subtitle: 'Transporte de passageiros com veículo próprio',
    icon: 'car-sport-outline',
    iconBg: '#EAF4FF',
    iconColor: '#006AFF',
    action: 'register',
  },
  {
    key: 'courier',
    title: 'Quero ser entregador',
    subtitle: 'Delivery de encomendas e compras na cidade',
    icon: 'bicycle-outline',
    iconBg: '#E8FAFC',
    iconColor: '#48CAE4',
    action: 'register',
  },
  {
    key: 'docs',
    title: 'Documentos e requisitos',
    subtitle: 'O que precisa para se candidatar',
    icon: 'document-text-outline',
    iconBg: '#E8EEF5',
    iconColor: '#0A2547',
    action: 'docs',
  },
  {
    key: 'support',
    title: 'Falar com a equipa Oholo',
    subtitle: 'Dúvidas sobre parceria e piloto em Nampula',
    icon: 'chatbubbles-outline',
    iconBg: '#F0F4FA',
    iconColor: '#51627B',
    action: 'support',
  },
];

function availabilityLabel(status) {
  if (status === 'available') return 'Disponível para pedidos';
  if (status === 'busy') return 'Ocupado';
  return 'Offline';
}

function typeLabel(t) {
  if (t === 'courier') return 'Entregador';
  if (t === 'both') return 'Motorista e entregador';
  return 'Motorista';
}

function showDocs() {
  Alert.alert(
    'Documentos e requisitos',
    '• Documento de identificação válido\n• Carta de condução (motorista)\n• Veículo em bom estado e seguro conforme lei\n• Conta Oholo com telefone verificado\n\nNa piloto, o registo é feito na app; a Oholo pode validar dados presencialmente em Nampula.'
  );
}

function showSupport() {
  Alert.alert(
    'Contacto',
    'Para parcerias e o piloto em Nampula, use os canais oficiais Oholo (redes sociais ou email da equipa). Em breve: chat na app.'
  );
}

export default function WorkTabScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionUserId, setSessionUserId] = useState(null);
  const [profile, setProfile] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        setLoading(true);
        try {
          initLocalDatabase();
          const uid = await getSessionUserId();
          if (!active) return;
          setSessionUserId(uid);
          if (uid != null) {
            const p = getProviderProfileForUser(uid);
            setProfile(p || null);
          } else {
            setProfile(null);
          }
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const onOptionPress = (action) => {
    if (action === 'register') {
      if (sessionUserId == null) {
        Alert.alert('Iniciar sessão', 'Entre na conta Oholo para registar o perfil de prestador.', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Entrar', onPress: () => router.push('/login') },
        ]);
        return;
      }
      if (profile) {
        router.push('/provider-hub');
        return;
      }
      router.push('/provider-register');
      return;
    }
    if (action === 'docs') {
      showDocs();
      return;
    }
    if (action === 'support') {
      showSupport();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/(tabs)')} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Trabalho</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenSubtitle}>
          Junte-se como motorista ou entregador e ganhe com a mobilidade na sua cidade.
        </Text>

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="small" color="#006AFF" />
          </View>
        ) : null}

        {!loading && sessionUserId == null ? (
          <View style={styles.banner}>
            <Ionicons name="log-in-outline" size={22} color="#0A2547" />
            <Text style={styles.bannerText}>
              Inicie sessão para criar o perfil de motorista ou entregador e gerir disponibilidade na app.
            </Text>
            <Pressable style={styles.bannerBtn} onPress={() => router.push('/login')}>
              <Text style={styles.bannerBtnText}>Entrar</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && sessionUserId != null && profile ? (
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <Ionicons name="checkmark-circle" size={28} color="#1B7A4C" />
              <View style={styles.activeCopy}>
                <Text style={styles.activeTitle}>Perfil de prestador activo</Text>
                <Text style={styles.activeSub}>
                  {typeLabel(String(profile.provider_type))} · {availabilityLabel(String(profile.availability_status))}
                </Text>
              </View>
            </View>
            <Pressable style={styles.hubBtn} onPress={() => router.push('/provider-hub')}>
              <Text style={styles.hubBtnText}>Abrir painel de prestador</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : null}

        {!loading && sessionUserId != null && !profile ? (
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Ainda não é parceiro Oholo?</Text>
            <Text style={styles.ctaBody}>
              Registe documento e veículo para aparecer na rede local (demo SQLite). Pode ser motorista, entregador ou ambos.
            </Text>
            <Pressable style={styles.ctaBtn} onPress={() => router.push('/provider-register')}>
              <Text style={styles.ctaBtnText}>Activar perfil de prestador</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="rocket-outline" size={18} color="#006AFF" />
            <Text style={styles.heroBadgeText}>Piloto em Nampula</Text>
          </View>
          <Text style={styles.heroTitle}>Parceria flexível</Text>
          <Text style={styles.heroBody}>
            Defina a sua disponibilidade, receba pedidos na app e acompanhe ganhos com transparência.
          </Text>
          <View style={styles.heroList}>
            <View style={styles.heroRow}>
              <Ionicons name="checkmark-circle" size={20} color="#1B7A4C" />
              <Text style={styles.heroRowText}>Pagamentos e suporte locais</Text>
            </View>
            <View style={styles.heroRow}>
              <Ionicons name="checkmark-circle" size={20} color="#1B7A4C" />
              <Text style={styles.heroRowText}>Formação inicial à plataforma</Text>
            </View>
            <View style={styles.heroRow}>
              <Ionicons name="checkmark-circle" size={20} color="#1B7A4C" />
              <Text style={styles.heroRowText}>Crescimento com delivery e bilhetes</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Como participar</Text>

        <View style={styles.list}>
          {OPTIONS.map((item) => (
            <Pressable key={item.key} style={styles.optionCard} onPress={() => onOptionPress(item.action)}>
              <View style={[styles.optionIconWrap, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={24} color={item.iconColor} />
              </View>
              <View style={styles.optionBody}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B8C4D6" />
            </Pressable>
          ))}
        </View>

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#0A2547" />
          <Text style={styles.infoText}>
            O painel de prestador (disponibilidade e veículos) está activo nesta versão. Pedidos em tempo real chegam com a API.
          </Text>
        </View>
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
  loadingBlock: {
    alignItems: 'center',
    marginBottom: 12,
  },
  screenSubtitle: {
    fontSize: 15,
    color: '#6C7B90',
    lineHeight: 22,
    marginBottom: 16,
  },
  banner: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2B63B8',
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#F6F8FC',
    gap: 10,
  },
  bannerText: {
    fontSize: 14,
    color: '#0A2547',
    lineHeight: 20,
    fontWeight: '500',
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#006AFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  bannerBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  activeCard: {
    borderRadius: 16,
    backgroundColor: '#0A2547',
    padding: 16,
    marginBottom: 16,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeCopy: { flex: 1 },
  activeTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  activeSub: { marginTop: 4, fontSize: 14, fontWeight: '600', color: '#C8D6E8' },
  hubBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#006AFF',
    height: 48,
    borderRadius: 10,
  },
  hubBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  ctaCard: {
    borderRadius: 16,
    backgroundColor: '#EAF4FF',
    borderWidth: 2,
    borderColor: '#006AFF',
    padding: 16,
    marginBottom: 16,
  },
  ctaTitle: { fontSize: 17, fontWeight: '800', color: '#0A2547' },
  ctaBody: { marginTop: 8, fontSize: 14, color: '#395271', lineHeight: 20 },
  ctaBtn: {
    marginTop: 14,
    backgroundColor: '#006AFF',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  heroCard: {
    borderRadius: 20,
    backgroundColor: '#0A2547',
    padding: 16,
    shadowColor: '#00000033',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A2547',
  },
  heroTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroBody: {
    marginTop: 8,
    fontSize: 15,
    color: '#C8D6E8',
    lineHeight: 22,
  },
  heroList: {
    marginTop: 14,
    gap: 10,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroRowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  list: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E8F2',
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  optionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBody: {
    flex: 1,
    minWidth: 0,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A2547',
  },
  optionSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#51627B',
    lineHeight: 18,
  },
  infoBanner: {
    marginTop: 18,
    borderWidth: 2,
    borderColor: '#2B63B8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: '#0A2547',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
