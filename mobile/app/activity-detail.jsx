import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  deliveryRouteParts,
  getActivityById,
  splitRouteSubtitle,
  statusStyle,
  typeMeta,
} from '../data/mockActivities';

export default function ActivityDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = String(params.id || '');

  const activity = useMemo(() => getActivityById(id), [id]);
  const meta = activity ? typeMeta(activity.type) : null;
  const st = activity ? statusStyle(activity.status) : null;
  const isDelivery = activity?.type === 'delivery';
  const deliveryParts = useMemo(
    () => (activity && isDelivery ? deliveryRouteParts(activity) : null),
    [activity, isDelivery]
  );
  const routeParts = useMemo(() => {
    if (!activity || isDelivery) return { origin: null, rest: '' };
    return splitRouteSubtitle(activity.subtitle);
  }, [activity, isDelivery]);

  const reference = id ? `OH-2024-${id.padStart(4, '0')}` : '—';

  if (!activity || !meta || !st) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Detalhe</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.missingBody}>
          <Ionicons name="alert-circle-outline" size={48} color="#006AFF" />
          <Text style={styles.missingTitle}>Atividade não encontrada</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Detalhe da atividade</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.heroIconWrap, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon} size={32} color={meta.color} />
          </View>
          <Text style={styles.typeLabel}>{meta.label}</Text>
          <Text style={styles.heroTitle}>{activity.title}</Text>
          <View style={[styles.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
            <Text style={[styles.badgeText, { color: st.color }]}>{activity.statusLabel}</Text>
          </View>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Resumo</Text>
            <View style={styles.brandRow}>
              <Image source={require('../assets/img/icon.png')} style={styles.brandIcon} />
              <Text style={styles.brandText}>Oholo</Text>
            </View>
          </View>

          {isDelivery && deliveryParts?.pickup ? (
            <>
              <View style={styles.summaryRow}>
                <Ionicons name="location" size={22} color="#3A84FF" />
                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryLabel}>Ponto de recolha</Text>
                  <Text style={styles.summaryValue}>{deliveryParts.pickup}</Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="flag" size={20} color="#0A2547" />
                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryLabel}>Ponto de entrega</Text>
                  <Text style={styles.summaryValue}>{deliveryParts.destination}</Text>
                </View>
              </View>
            </>
          ) : isDelivery && deliveryParts && !deliveryParts.pickup ? (
            <Text style={styles.plainSummary}>{deliveryParts.destination}</Text>
          ) : routeParts.origin ? (
            <>
              <View style={styles.summaryRow}>
                <Ionicons name="location" size={22} color="#48CAE4" />
                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryLabel}>Origem</Text>
                  <Text style={styles.summaryValue}>{routeParts.origin}</Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="flag" size={20} color="#0A2547" />
                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryLabel}>Destino / detalhe</Text>
                  <Text style={styles.summaryValue}>{routeParts.rest}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.plainSummary}>{activity.subtitle}</Text>
          )}

          <Text style={styles.refText}>Ref. Oholo: {reference}</Text>
          {isDelivery && activity.deliveryReference ? (
            <Text style={styles.refTextSecondary}>Referência no local: {activity.deliveryReference}</Text>
          ) : null}

          <Text style={styles.sectionTitle}>{isDelivery ? 'Detalhes do pedido' : 'Informação'}</Text>
          <View style={styles.metricsGroup}>
            <View style={styles.metricRow}>
              <Ionicons name="calendar-outline" size={17} color="#0A2547" />
              <View style={styles.metricCopy}>
                <Text style={styles.metricLabel}>Data e hora</Text>
                <Text style={styles.metricValue}>
                  {activity.date} · {activity.time}
                </Text>
              </View>
            </View>
            {isDelivery && activity.itemCategory ? (
              <View style={styles.metricRow}>
                <Ionicons name="cube-outline" size={17} color="#0A2547" />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricLabel}>Tipo de carga</Text>
                  <Text style={styles.metricValue}>{activity.itemCategory}</Text>
                </View>
              </View>
            ) : null}
            {isDelivery && activity.itemDescription ? (
              <View style={styles.metricRow}>
                <Ionicons name="document-text-outline" size={17} color="#0A2547" />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricLabel}>Descrição do item</Text>
                  <Text style={styles.metricValue}>{activity.itemDescription}</Text>
                </View>
              </View>
            ) : null}
            {isDelivery && activity.distanceKm ? (
              <View style={styles.metricRow}>
                <Ionicons name="navigate-outline" size={17} color="#0A2547" />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricLabel}>Distância</Text>
                  <Text style={styles.metricValue}>{activity.distanceKm}</Text>
                </View>
              </View>
            ) : null}
            {isDelivery && activity.durationMin ? (
              <View style={styles.metricRow}>
                <Ionicons name="time-outline" size={17} color="#0A2547" />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricLabel}>Tempo estimado (rota)</Text>
                  <Text style={styles.metricValue}>{activity.durationMin}</Text>
                </View>
              </View>
            ) : null}
            {isDelivery && activity.courierName ? (
              <View style={styles.metricRow}>
                <Ionicons name="bicycle-outline" size={17} color="#0A2547" />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricLabel}>Entregador</Text>
                  <Text style={styles.metricValue}>{activity.courierName}</Text>
                </View>
              </View>
            ) : null}
            {activity.amount ? (
              <View style={styles.metricRow}>
                <Ionicons name="wallet-outline" size={17} color="#0A2547" />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricLabel}>{isDelivery ? 'Taxa / valor' : 'Valor'}</Text>
                  <Text style={styles.metricValue}>{activity.amount}</Text>
                </View>
              </View>
            ) : null}
            {activity.paymentMethod ? (
              <View style={styles.metricRow}>
                <Ionicons name="card-outline" size={17} color="#0A2547" />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricLabel}>Pagamento</Text>
                  <Text style={styles.metricValue}>{activity.paymentMethod}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {activity.status === 'cancelled' ? (
            <View style={styles.noteBox}>
              <Ionicons name="information-circle-outline" size={20} color="#0A2547" />
              <Text style={styles.noteText}>Esta atividade foi cancelada. Não foi gerado cobrança.</Text>
            </View>
          ) : null}

          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Voltar às atividades</Text>
          </Pressable>
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
  body: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  header: {
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: '#0A2547',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#63758F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '800',
    color: '#1E2D45',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  badge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryTitle: {
    color: '#0A2547',
    fontSize: 16,
    fontWeight: '800',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandIcon: {
    width: 16,
    height: 16,
  },
  brandText: {
    color: '#0A2547',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryLabel: {
    color: '#51627B',
    fontSize: 14,
  },
  summaryValue: {
    color: '#1F2F47',
    fontSize: 16,
    fontWeight: '700',
  },
  plainSummary: {
    color: '#1F2F47',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  refText: {
    marginTop: 4,
    color: '#7C8DA5',
    fontSize: 13,
    textAlign: 'center',
  },
  refTextSecondary: {
    marginTop: 6,
    color: '#51627B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    color: '#0A2547',
    fontSize: 16,
    fontWeight: '800',
  },
  metricsGroup: {
    gap: 8,
  },
  metricRow: {
    minHeight: 56,
    backgroundColor: '#F8FAFD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3EAF4',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricCopy: {
    flex: 1,
  },
  metricLabel: {
    color: '#51627B',
    fontSize: 12,
  },
  metricValue: {
    color: '#1F2F47',
    fontSize: 15,
    fontWeight: '800',
  },
  noteBox: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E3EAF4',
  },
  noteText: {
    flex: 1,
    color: '#51627B',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 14,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#006AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  missingBody: {
    flex: 1,
    backgroundColor: '#F6F8FC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  missingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A2547',
    textAlign: 'center',
  },
});
