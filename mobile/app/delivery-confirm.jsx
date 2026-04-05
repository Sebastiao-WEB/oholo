import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  estimateDeliveryFee,
  labelForDeliveryCategory,
  labelForSizeTier,
  labelForWeightTier,
} from '../utils/deliveryPricing';

const DELIVERY_SERVICE_OPTIONS = [
  {
    id: 'standard',
    label: 'Standard',
    multiplier: 1,
    etaFactor: 1,
    hint: 'Melhor custo',
    icon: 'cube-outline',
  },
  {
    id: 'express',
    label: 'Expresso',
    multiplier: 1.22,
    etaFactor: 0.82,
    hint: 'Prioridade',
    icon: 'flash-outline',
  },
  {
    id: 'economico',
    label: 'Económico',
    multiplier: 0.9,
    etaFactor: 1.18,
    hint: 'Janela alargada',
    icon: 'timer-outline',
  },
];

const PAYMENT_OPTIONS = [
  { id: 'dinheiro', label: 'Dinheiro', icon: require('../assets/img/money.png') },
  { id: 'mpesa', label: 'M-Pesa', icon: require('../assets/img/mpesa.webp') },
  { id: 'emola', label: 'e-Mola', icon: require('../assets/img/emola.jpg') },
];

export default function DeliveryConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedService, setSelectedService] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('dinheiro');

  const pickupName = String(params.pickupName || 'Recolha não definida');
  const destinationName = String(params.destinationName || 'Entrega não definida');
  const pickupLat = String(params.pickupLat || '');
  const pickupLon = String(params.pickupLon || '');
  const destinationLat = String(params.destinationLat || '');
  const destinationLon = String(params.destinationLon || '');
  const itemDescription = String(params.itemDescription || '');
  const distanceKm = Number(params.distanceKm || 0);
  const durationMin = Number(params.durationMin || 0);
  const categoryId = String(params.categoryId || 'documents');
  const weightTier = String(params.weightTier || 'light');
  const sizeTier = String(params.sizeTier || 'small');

  const baseFee = useMemo(
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

  const serviceOptionsWithPricing = useMemo(() => {
    const safeDuration = durationMin > 0 ? durationMin : 5;
    return DELIVERY_SERVICE_OPTIONS.map((opt) => ({
      ...opt,
      price: Math.max(8, Math.round(baseFee * opt.multiplier)),
      eta: `${Math.max(1, Math.round(safeDuration * opt.etaFactor))} min`,
    }));
  }, [baseFee, durationMin]);

  const selectedServiceData = useMemo(
    () =>
      serviceOptionsWithPricing.find((o) => o.id === selectedService) || serviceOptionsWithPricing[0],
    [serviceOptionsWithPricing, selectedService]
  );

  const selectedPaymentLabel = useMemo(
    () => PAYMENT_OPTIONS.find((o) => o.id === selectedPayment)?.label || 'Dinheiro',
    [selectedPayment]
  );

  const distanceDisplay = (distanceKm > 0 ? distanceKm : 2).toFixed(1).replace('.', ',');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Confirmar delivery</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroStrip}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="bicycle" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Oholo Delivery</Text>
            <Text style={styles.heroSubtitle}>Recolha e entrega na mesma corrida — confirme os dados e o pagamento.</Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Resumo da rota</Text>
          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={styles.routeBlock}>
                <View style={styles.routeLabelRow}>
                  <Ionicons name="location" size={16} color="#2E7BFF" />
                  <Text style={styles.routeLabel}>Recolha</Text>
                </View>
                <Text style={styles.routeValue} numberOfLines={2}>
                  {pickupName}
                </Text>
              </View>

              <View style={styles.routeConnector}>
                <View style={styles.routeConnectorLine} />
                <Ionicons name="arrow-forward" size={16} color="#2E7BFF" />
                <View style={styles.routeConnectorLine} />
              </View>

              <View style={styles.routeBlock}>
                <View style={styles.routeLabelRow}>
                  <Ionicons name="flag" size={16} color="#2E7BFF" />
                  <Text style={styles.routeLabel}>Entrega</Text>
                </View>
                <Text style={styles.routeValue} numberOfLines={2}>
                  {destinationName}
                </Text>
              </View>
            </View>
            <View style={styles.routeSeparator} />
            <Text style={styles.routeReference}>
              Taxa com base em distância, tempo, categoria, peso e volume — ajustável pelo tipo de serviço abaixo.
            </Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Informações estimadas</Text>
          <View style={styles.tripInfoRow}>
            <View style={styles.tripInfoItem}>
              <Ionicons name="time-outline" size={24} color="#0A2547" />
              <Text style={styles.tripInfoLabel}>Tempo estimado</Text>
              <Text style={styles.tripInfoValue}>{selectedServiceData.eta}</Text>
            </View>
            <View style={styles.tripDivider} />
            <View style={styles.tripInfoItem}>
              <Ionicons name="card-outline" size={24} color="#0A2547" />
              <Text style={styles.tripInfoLabel}>Taxa estimada</Text>
              <Text style={styles.tripInfoValue}>{selectedServiceData.price} MT</Text>
            </View>
            <View style={styles.tripDivider} />
            <View style={styles.tripInfoItem}>
              <Ionicons name="navigate-outline" size={24} color="#0A2547" />
              <Text style={styles.tripInfoLabel}>Distância</Text>
              <Text style={styles.tripInfoValue}>{distanceDisplay} km</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Tipo de serviço</Text>
            <Ionicons name="chevron-forward" size={18} color="#5D6D84" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceRow}>
            {serviceOptionsWithPricing.map((option) => {
              const active = selectedService === option.id;
              return (
                <Pressable
                  key={option.id}
                  style={[styles.serviceCard, active && styles.serviceCardActive]}
                  onPress={() => setSelectedService(option.id)}
                >
                  <Ionicons name={option.icon} size={30} color="#0A2547" />
                  <Text style={styles.serviceName}>{option.label}</Text>
                  <Text style={styles.serviceHint}>{option.hint}</Text>
                  <Text style={styles.servicePrice}>{option.price} MT</Text>
                  <Text style={styles.serviceEta}>Entrega em ~{option.eta}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>A sua carga</Text>
          <View style={styles.cargoCard}>
            <View style={styles.cargoRow}>
              <View style={styles.cargoIcon}>
                <Ionicons name="file-tray-full-outline" size={20} color="#2E7BFF" />
              </View>
              <View style={styles.cargoCopy}>
                <Text style={styles.cargoLabel}>Categoria</Text>
                <Text style={styles.cargoValue}>{labelForDeliveryCategory(categoryId)}</Text>
              </View>
            </View>
            <View style={styles.cargoDivider} />
            <View style={styles.cargoRow}>
              <View style={styles.cargoIcon}>
                <Ionicons name="barbell-outline" size={20} color="#2E7BFF" />
              </View>
              <View style={styles.cargoCopy}>
                <Text style={styles.cargoLabel}>Peso</Text>
                <Text style={styles.cargoValue}>{labelForWeightTier(weightTier)}</Text>
              </View>
            </View>
            <View style={styles.cargoDivider} />
            <View style={styles.cargoRow}>
              <View style={styles.cargoIcon}>
                <Ionicons name="expand-outline" size={20} color="#2E7BFF" />
              </View>
              <View style={styles.cargoCopy}>
                <Text style={styles.cargoLabel}>Volume</Text>
                <Text style={styles.cargoValue}>{labelForSizeTier(sizeTier)}</Text>
              </View>
            </View>
            <View style={styles.cargoDivider} />
            <View style={styles.cargoRow}>
              <View style={styles.cargoIcon}>
                <Ionicons name="chatbox-ellipses-outline" size={20} color="#2E7BFF" />
              </View>
              <View style={styles.cargoCopy}>
                <Text style={styles.cargoLabel}>Notas para o entregador</Text>
                <Text style={styles.cargoValue}>
                  {itemDescription.trim() ? itemDescription : 'Sem notas adicionais'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Métodos de pagamento</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paymentRow}>
            {PAYMENT_OPTIONS.map((option) => {
              const active = selectedPayment === option.id;
              return (
                <Pressable
                  key={option.id}
                  style={[styles.paymentChip, active && styles.paymentChipActive]}
                  onPress={() => setSelectedPayment(option.id)}
                >
                  <Image source={option.icon} style={styles.paymentIcon} resizeMode="contain" />
                  <Text style={styles.paymentText}>{option.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.confirmButton}
          onPress={() => {
            const deliveryCode = `DLV-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
            router.push({
              pathname: '/delivery-searching',
              params: {
                deliveryCode,
                pickupName,
                destinationName,
                pickupLat,
                pickupLon,
                destinationLat,
                destinationLon,
                distanceKm: distanceKm > 0 ? distanceKm.toFixed(1) : '0',
                durationMin: String(durationMin > 0 ? Math.max(1, Math.round(durationMin)) : 5),
                itemDescription,
                categoryId,
                weightTier,
                sizeTier,
                deliveryFee: String(selectedServiceData.price),
                paymentMethod: selectedPaymentLabel,
                serviceType: selectedServiceData.label,
              },
            });
          }}
        >
          <Text style={styles.confirmButtonText}>Confirmar pedido</Text>
        </Pressable>
      </View>
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
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 22,
  },
  heroStrip: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3EAF4',
    shadowColor: '#00000014',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#3A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0A2547',
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#5D6D84',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2F47',
    marginBottom: 5,
  },
  sectionBlock: {
    marginTop: 16,
  },
  sectionTitleRow: {
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#0000001A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 8,
  },
  routeBlock: {
    flex: 1,
    backgroundColor: '#F8FAFD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3EAF4',
    padding: 10,
  },
  routeLabel: {
    color: '#1C2E47',
    fontSize: 14,
    fontWeight: '700',
  },
  routeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeValue: {
    marginTop: 4,
    color: '#2B3C54',
    fontSize: 13,
  },
  routeConnector: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  routeConnectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#C9D9EF',
    borderRadius: 1,
  },
  routeSeparator: {
    marginTop: 10,
    marginBottom: 8,
    height: 1,
    backgroundColor: '#E4EAF2',
  },
  routeReference: {
    textAlign: 'center',
    color: '#3D4E66',
    fontSize: 13,
    lineHeight: 18,
  },
  tripInfoRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 12,
  },
  tripInfoItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tripInfoLabel: {
    marginTop: 6,
    fontSize: 13,
    color: '#6A7789',
  },
  tripInfoValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '800',
    color: '#1E2D45',
  },
  tripDivider: {
    width: 1,
    backgroundColor: '#E3E9F2',
  },
  serviceRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 8,
  },
  serviceCard: {
    width: 168,
    minHeight: 148,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D4DCE8',
    backgroundColor: '#F8FAFD',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  serviceCardActive: {
    borderColor: '#2E7BFF',
    backgroundColor: '#EDF4FF',
  },
  serviceName: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2D45',
  },
  serviceHint: {
    marginTop: 2,
    fontSize: 12,
    color: '#6A7789',
    fontWeight: '600',
  },
  servicePrice: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '800',
    color: '#1E2D45',
  },
  serviceEta: {
    marginTop: 4,
    fontSize: 13,
    color: '#4A5A70',
    textAlign: 'center',
  },
  cargoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#0000001A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  cargoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cargoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cargoCopy: {
    flex: 1,
  },
  cargoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6A7789',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cargoValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E2D45',
    lineHeight: 21,
  },
  cargoDivider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginLeft: 64,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  paymentChip: {
    width: 132,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#CDD7E5',
    backgroundColor: '#F8FAFD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
  },
  paymentChipActive: {
    borderColor: '#2E7BFF',
    backgroundColor: '#EDF4FF',
  },
  paymentText: {
    fontSize: 15,
    color: '#1F2F47',
    fontWeight: '600',
  },
  paymentIcon: {
    width: 22,
    height: 22,
  },
  footer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5EAF2',
  },
  confirmButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0A2547',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
