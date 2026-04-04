import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RIDE_OPTIONS = [
  { id: 'economica', label: 'Económica', price: 23, eta: '4 min', icon: 'car-outline' },
  { id: 'executiva', label: 'Executiva', price: 32, eta: '4 min', icon: 'car-sport-outline' },
  { id: 'moto', label: 'Moto', price: 18, eta: '3 min', icon: 'bicycle-outline' },
];

const PAYMENT_OPTIONS = [
  { id: 'dinheiro', label: 'Dinheiro', icon: require('../assets/img/money.png') },
  { id: 'mpesa', label: 'M-Pesa', icon: require('../assets/img/mpesa.webp') },
  { id: 'emola', label: 'e-Mola', icon: require('../assets/img/emola.jpg') },
];

export default function RideConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedRide, setSelectedRide] = useState('economica');
  const [selectedPayment, setSelectedPayment] = useState('dinheiro');

  const pickupName = String(params.pickupName || 'Origem não definida');
  const destinationName = String(params.destinationName || 'Destino não definido');
  const distanceKm = Number(params.distanceKm || 0);
  const durationMin = Number(params.durationMin || 0);
  const pickupLat = String(params.pickupLat || '');
  const pickupLon = String(params.pickupLon || '');
  const destinationLat = String(params.destinationLat || '');
  const destinationLon = String(params.destinationLon || '');

  const rideOptionsWithPricing = useMemo(() => {
    const safeDistance = distanceKm > 0 ? distanceKm : 3.2;
    const safeDuration = durationMin > 0 ? durationMin : 4;
    const economicalPrice = Math.round(10 + safeDistance * 3 + safeDuration * 1.2);
    const executivePrice = Math.round(economicalPrice * 1.35);
    const executiveEta = Math.max(1, Math.round(safeDuration * 0.95));
    const motoPrice = Math.max(8, Math.round(economicalPrice * 0.78));
    const motoEta = Math.max(1, Math.round(safeDuration * 0.75));

    return [
      { ...RIDE_OPTIONS[0], price: economicalPrice, eta: `${safeDuration} min` },
      { ...RIDE_OPTIONS[1], price: executivePrice, eta: `${executiveEta} min` },
      { ...RIDE_OPTIONS[2], price: motoPrice, eta: `${motoEta} min` },
    ];
  }, [distanceKm, durationMin]);

  const selectedRideData = useMemo(
    () => rideOptionsWithPricing.find((option) => option.id === selectedRide) || rideOptionsWithPricing[0],
    [rideOptionsWithPricing, selectedRide]
  );
  const selectedPaymentLabel = useMemo(
    () => PAYMENT_OPTIONS.find((option) => option.id === selectedPayment)?.label || 'Dinheiro',
    [selectedPayment]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Confirmar corrida</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Resumo da rota</Text>
          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={styles.routeBlock}>
                <View style={styles.routeLabelRow}>
                  <Ionicons name="location" size={16} color="#2E7BFF" />
                  <Text style={styles.routeLabel}>Origem</Text>
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
                  <Text style={styles.routeLabel}>Destino</Text>
                </View>
                <Text style={styles.routeValue} numberOfLines={2}>
                  {destinationName}
                </Text>
              </View>
            </View>
            <View style={styles.routeSeparator} />
            <Text style={styles.routeReference}>Referência: calculada com base na rota selecionada</Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Informações estimadas da viagem</Text>
          <View style={styles.tripInfoRow}>
            <View style={styles.tripInfoItem}>
              <Ionicons name="time-outline" size={24} color="#0A2547" />
              <Text style={styles.tripInfoLabel}>Tempo estimado</Text>
            <Text style={styles.tripInfoValue}>{selectedRideData.eta}</Text>
            </View>
            <View style={styles.tripDivider} />
            <View style={styles.tripInfoItem}>
              <Ionicons name="card-outline" size={24} color="#0A2547" />
              <Text style={styles.tripInfoLabel}>Valor estimado</Text>
              <Text style={styles.tripInfoValue}>{selectedRideData.price} MT</Text>
            </View>
            <View style={styles.tripDivider} />
            <View style={styles.tripInfoItem}>
              <Ionicons name="location-outline" size={24} color="#0A2547" />
              <Text style={styles.tripInfoLabel}>Distância</Text>
              <Text style={styles.tripInfoValue}>{(distanceKm || 3.2).toFixed(1).replace('.', ',')} km</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Seleção do tipo de corrida</Text>
            <Ionicons name="chevron-forward" size={18} color="#5D6D84" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rideTypeRow}>
            {rideOptionsWithPricing.map((option) => {
              const active = selectedRide === option.id;
              return (
                <Pressable
                  key={option.id}
                  style={[styles.rideTypeCard, active && styles.rideTypeCardActive]}
                  onPress={() => setSelectedRide(option.id)}
                >
                  <Ionicons name={option.icon} size={30} color="#0A2547" />
                  <Text style={styles.rideTypeName}>{option.label}</Text>
                  <Text style={styles.rideTypePrice}>{option.price} MT</Text>
                  <Text style={styles.rideTypeEta}>Chegada em {option.eta}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
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
          onPress={() =>
            router.push({
              pathname: '/ride-searching',
              params: {
                pickupName,
                destinationName,
                rideType: selectedRideData.label,
                estimatedPrice: String(selectedRideData.price),
                paymentMethod: selectedPaymentLabel,
                pickupLat,
                pickupLon,
                destinationLat,
                destinationLon,
                distanceKm: (distanceKm || 3.2).toFixed(1),
                etaMin: selectedRideData.eta,
              },
            })
          }
        >
          <Text style={styles.confirmButtonText}>Confirmar corrida</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  header: {
    height: 54,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2547',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 32 / 2,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 24,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 22,
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
    fontSize: 14 / 1.1,
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
    fontSize: 28 / 2,
    fontWeight: '800',
    color: '#1E2D45',
  },
  tripDivider: {
    width: 1,
    backgroundColor: '#E3E9F2',
  },
  rideTypeRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 8,
  },
  rideTypeCard: {
    width: 168,
    minHeight: 136,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D4DCE8',
    backgroundColor: '#F8FAFD',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  rideTypeCardActive: {
    borderColor: '#2E7BFF',
    backgroundColor: '#EDF4FF',
  },
  rideTypeName: {
    marginTop: 8,
    fontSize: 17 / 1.1,
    fontWeight: '700',
    color: '#1E2D45',
  },
  rideTypePrice: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '800',
    color: '#1E2D45',
  },
  rideTypeEta: {
    marginTop: 4,
    fontSize: 14,
    color: '#4A5A70',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  paymentChip: {
    width: 132,
    height: 46,
    borderRadius: 15,
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
    borderRadius: 24,
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
