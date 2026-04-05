import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_ACTIVITIES, statusStyle, typeMeta } from '../../data/mockActivities';

const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'ride', label: 'Corridas' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'ticket', label: 'Bilhetes' },
];

export default function ActivitiesTabScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_ACTIVITIES.filter((item) => {
      if (filter !== 'all' && item.type !== filter) return false;
      if (!q) return true;
      const hay = `${item.title} ${item.subtitle} ${item.date}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, filter]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/(tabs)')} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Atividades</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenSubtitle}>Histórico de corridas, delivery e bilhetes</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#6B7D96" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Pesquisar por destino ou data"
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
          {filtered.length === 1 ? '1 atividade' : `${filtered.length} atividades`}
        </Text>

        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="file-tray-outline" size={36} color="#006AFF" />
            </View>
            <Text style={styles.emptyTitle}>Nenhum resultado</Text>
            <Text style={styles.emptyText}>Ajuste a pesquisa ou o filtro para ver as suas atividades.</Text>
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
                  onPress={() => router.push({ pathname: '/activity-detail', params: { id: item.id } })}
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
    paddingBottom: 24,
  },
  screenSubtitle: {
    fontSize: 15,
    color: '#6C7B90',
    marginBottom: 14,
  },
  searchBox: {
    height: 50,
    borderRadius: 25,
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
    borderRadius: 20,
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
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardSubtitle: {
    marginTop: 4,
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
    fontWeight: '600',
  },
  amount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#006AFF',
  },
  emptyCard: {
    marginTop: 8,
    padding: 24,
    borderRadius: 20,
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
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0A2547',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 15,
    color: '#63758F',
    textAlign: 'center',
    lineHeight: 22,
  },
});
