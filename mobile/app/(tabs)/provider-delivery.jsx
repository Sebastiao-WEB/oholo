import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProviderProfileForUser, initLocalDatabase } from '../../db';
import { getSessionUserId } from '../../utils/session';

export default function ProviderDeliveryTabScreen() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        initLocalDatabase();
        const uid = await getSessionUserId();
        if (!active) return;
        if (uid == null) {
          setHasProfile(false);
          return;
        }
        const p = getProviderProfileForUser(uid);
        setHasProfile(!!p);
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/(tabs)')} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Delivery (prestador)</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Encomendas atribuídas a si, recolha, entrega e estado do percurso aparecerão aqui quando o backend estiver activo.
        </Text>

        {!hasProfile ? (
          <View style={styles.banner}>
            <Ionicons name="person-add-outline" size={22} color="#0A2547" />
            <Text style={styles.bannerText}>Como entregador, active primeiro o perfil Oholo.</Text>
            <Pressable style={styles.bannerBtn} onPress={() => router.push('/provider-register')}>
              <Text style={styles.bannerBtnText}>Activar perfil</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Ionicons name="bicycle-outline" size={28} color="#48CAE4" />
            <Text style={styles.cardTitle}>Sem entregas na demo</Text>
            <Text style={styles.cardBody}>
              Na piloto local, os pedidos de delivery dos clientes serão listados aqui para o seu fluxo de recolha e entrega.
            </Text>
            <Pressable style={styles.linkBtn} onPress={() => router.push('/provider-hub')}>
              <Text style={styles.linkBtnText}>Gerir veículos e disponibilidade</Text>
              <Ionicons name="chevron-forward" size={18} color="#006AFF" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A2547' },
  header: {
    height: 56,
    backgroundColor: '#0A2547',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  headerSpacer: { width: 26 },
  scroll: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 18, paddingBottom: 28 },
  lead: { fontSize: 15, color: '#6C7B90', lineHeight: 22, marginBottom: 18 },
  banner: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2B63B8',
    padding: 14,
    backgroundColor: '#F6F8FC',
    gap: 10,
  },
  bannerText: { fontSize: 14, color: '#0A2547', lineHeight: 20, fontWeight: '500' },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#006AFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  bannerBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  card: {
    borderRadius: 16,
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E3EAF4',
    padding: 18,
    gap: 10,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#0A2547' },
  cardBody: { fontSize: 14, color: '#51627B', lineHeight: 21 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  linkBtnText: { fontSize: 15, fontWeight: '800', color: '#006AFF' },
});
