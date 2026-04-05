import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  estimateDeliveryFee,
  labelForDeliveryCategory,
  labelForSizeTier,
  labelForWeightTier,
} from '../utils/deliveryPricing';

export default function DeliveryConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const pickupName = String(params.pickupName || 'Recolha não definida');
  const destinationName = String(params.destinationName || 'Entrega não definida');
  const itemDescription = String(params.itemDescription || '');
  const distanceKm = Number(params.distanceKm || 0);
  const durationMin = Number(params.durationMin || 0);
  const categoryId = String(params.categoryId || 'documents');
  const weightTier = String(params.weightTier || 'light');
  const sizeTier = String(params.sizeTier || 'small');

  const feeEstimate = useMemo(
    () =>
      estimateDeliveryFee({
        distanceKm,
        durationMin,
        categoryId,
        weightTier,
        sizeTier,
      }),
    [distanceKm, durationMin, categoryId, weightTier, sizeTier]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Confirmar delivery</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Resumo do pedido. A taxa estimada combina distância, tempo de rota, tipo de carga, peso e tamanho (regras mock no app; a API Laravel poderá substituir).
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recolha</Text>
          <Text style={styles.cardValue}>{pickupName}</Text>
          <Text style={styles.cardTitle}>Entrega</Text>
          <Text style={styles.cardValue}>{destinationName}</Text>
          <Text style={styles.cardTitle}>Tipo de carga</Text>
          <Text style={styles.cardValue}>{labelForDeliveryCategory(categoryId)}</Text>
          <Text style={styles.cardTitle}>Peso</Text>
          <Text style={styles.cardValue}>{labelForWeightTier(weightTier)}</Text>
          <Text style={styles.cardTitle}>Volume</Text>
          <Text style={styles.cardValue}>{labelForSizeTier(sizeTier)}</Text>
          <Text style={styles.cardTitle}>Detalhes</Text>
          <Text style={styles.cardValue}>{itemDescription.trim() ? itemDescription : '—'}</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Distância</Text>
              <Text style={styles.metricValue}>{distanceKm > 0 ? `${distanceKm.toFixed(1)} km` : '—'}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Tempo est.</Text>
              <Text style={styles.metricValue}>{durationMin > 0 ? `${durationMin} min` : '—'}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Taxa est.</Text>
              <Text style={styles.metricValue}>{feeEstimate} MT</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            Alert.alert(
              'Oholo',
              'O passo seguinte (procurar entregador) será implementado em delivery-searching. Por agora pode voltar ao início.'
            )
          }
        >
          <Text style={styles.primaryButtonText}>Confirmar pedido</Text>
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
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3EAF4',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#63758F',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A2547',
    lineHeight: 22,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },
  metric: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: '#F8FAFD',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E3EAF4',
  },
  metricLabel: {
    fontSize: 11,
    color: '#63758F',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3A84FF',
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
