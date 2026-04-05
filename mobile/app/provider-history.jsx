import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import KeyboardAvoidingForm from '../components/KeyboardAvoidingForm';
import { initLocalDatabase, listProviderActivitiesForUser } from '../db';
import { statusStyle, typeMeta } from '../data/mockActivities';
import { getSessionUserId } from '../utils/session';

const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'ride', label: 'Corridas' },
  { id: 'delivery', label: 'Delivery' },
];

export default function ProviderHistoryScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [sessionUserId, setSessionUserId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          initLocalDatabase();
          const userId = await getSessionUserId();
          if (!active) return;
          setSessionUserId(userId);
          if (userId == null) {
            setItems([]);
            return;
          }
          setItems(listProviderActivitiesForUser(userId));
        } catch (e) {
          console.error(e);
          if (active) setItems([]);
        }
      })();
      return () => {
        active = false;
      };
    }, [router])
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== 'all' && item.type !== filter) return false;
      if (!q) return true;
      const hay = `${item.title} ${item.subtitle} ${item.statusLabel} ${item.date} ${item.customerName || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, filter, items]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Histórico prestador</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingForm scrollStyle={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.screenSubtitle}>
          Corridas e entregas em que foi motorista ou entregador. Estados: concluído, cancelado pelo cliente, pelo motorista
          ou pelo entregador (conforme registo local).
        </Text>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#6B7D96" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Pesquisar por cliente, rota ou estado"
            placeholderTextColor="#6B7D96"
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTERS.map((chip) => {
            const active = filter === chip.id;
            return (
              <Pressable
                key={chip.id}
                onPress={() => setFilter(chip.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>
          {filtered.length === 1 ? '1 serviço' : `${filtered.length} serviços`}
        </Text>

        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="briefcase-outline" size={36} color="#006AFF" />
            </View>
            <Text style={styles.emptyTitle}>Sem histórico de prestador</Text>
            <Text style={styles.emptyText}>
              {sessionUserId == null
                ? 'Inicie sessão para ver o histórico de serviços como prestador.'
                : items.length === 0
                  ? 'Ainda não há registos em que tenha sido o motorista ou entregador atribuído. Na demo, o parceiro sorteado no mapa tem de ser a sua conta. Estados: concluído, cancelado pelo cliente ou pelo motorista/entregador (conforme o motivo guardado).'
                  : 'Ajuste a pesquisa ou o filtro.'}
            </Text>
            {sessionUserId == null ? (
              <Pressable style={styles.loginBtn} onPress={() => router.replace('/login')}>
                <Text style={styles.loginBtnText}>Entrar</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((item) => {
              const meta = typeMeta(item.type);
              const st = statusStyle(item.status);
              return (
                <Pressable
                  key={item.id}
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: '/activity-detail',
                      params: { id: item.id, perspective: 'provider' },
                    })
                  }
                >
                  <View style={[styles.typeIconWrap, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={22} color={meta.color} />
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
                        <Text style={[styles.badgeText, { color: st.color }]}>{item.statusLabel}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardSubtitle} numberOfLines={2}>
                      {item.subtitle}
                    </Text>
                    <View style={styles.cardFooter}>
                      <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={14} color="#63758F" />
                        <Text style={styles.dateText}>
                          {item.date} · {item.time}
                        </Text>
                      </View>
                      {item.amount ? <Text style={styles.amount}>{item.amount}</Text> : null}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#B8C4D6" />
                </Pressable>
              );
            })}
          </View>
        )}
      </KeyboardAvoidingForm>
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
    paddingBottom: 24,
  },
  screenSubtitle: {
    fontSize: 15,
    color: '#6C7B90',
    marginBottom: 14,
    lineHeight: 22,
  },
  searchBox: {
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2B63B8',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#0A2547',
    fontSize: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F0F4FA',
    borderWidth: 1,
    borderColor: '#E0E8F2',
  },
  chipActive: {
    backgroundColor: '#0A2547',
    borderColor: '#0A2547',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#51627B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#63758F',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  list: {
    gap: 10,
  },
  card: {
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
  typeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0A2547',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: '48%',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#51627B',
    lineHeight: 19,
  },
  cardFooter: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#63758F',
  },
  amount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A2547',
  },
  emptyCard: {
    marginTop: 8,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E3EAF4',
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0A2547',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#51627B',
    textAlign: 'center',
    lineHeight: 21,
  },
  loginBtn: {
    marginTop: 16,
    backgroundColor: '#006AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
