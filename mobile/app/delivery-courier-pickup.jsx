import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const USE_MOCK_DRIVER_ARRIVAL_DURATION = __DEV__;
const MOCK_DRIVER_ARRIVAL_SECONDS = 20;

export default function DeliveryCourierPickupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef(null);
  const hasNavigatedToTripRef = useRef(false);

  const pickupName = String(params.pickupName || 'Origem');
  const destinationName = String(params.destinationName || 'Destino');
  const deliveryFee = String(params.deliveryFee || params.estimatedPrice || '0');
  const paymentMethod = String(params.paymentMethod || 'Dinheiro');
  const itemDescription = String(params.itemDescription || '');
  const durationMinParam = String(params.durationMin || '5');
  const etaMin = `${durationMinParam} min`;
  const distanceKm = String(params.distanceKm || '1,2');
  const categoryId = String(params.categoryId || 'documents');
  const weightTier = String(params.weightTier || 'light');
  const sizeTier = String(params.sizeTier || 'small');

  const pickupLat = Number(params.pickupLat || -15.1234);
  const pickupLon = Number(params.pickupLon || 39.2612);
  const destinationLat = Number(params.destinationLat || -15.1096);
  const destinationLon = Number(params.destinationLon || 39.2864);
  const driverLat = Number(params.driverLat || -15.1163);
  const driverLon = Number(params.driverLon || 39.2726);

  const pickupCoordinate = useMemo(
    () => ({ latitude: pickupLat, longitude: pickupLon }),
    [pickupLat, pickupLon]
  );
  const driverCoordinate = useMemo(
    () => ({ latitude: driverLat, longitude: driverLon }),
    [driverLat, driverLon]
  );
  const [driverRouteCoordinates, setDriverRouteCoordinates] = useState([driverCoordinate, pickupCoordinate]);
  const [movingDriverCoordinate, setMovingDriverCoordinate] = useState(driverCoordinate);
  const [routeEtaSeconds, setRouteEtaSeconds] = useState(null);

  const fallbackEtaMinutes = useMemo(() => {
    const numeric = Number.parseFloat(etaMin.replace(',', '.'));
    if (!Number.isFinite(numeric) || numeric <= 0) return 3;
    return numeric;
  }, [etaMin]);
  const baseEtaSeconds = routeEtaSeconds ?? Math.ceil(fallbackEtaMinutes * 60);
  const [etaRemainingSeconds, setEtaRemainingSeconds] = useState(baseEtaSeconds);
  const etaDisplay = useMemo(() => {
    if (etaRemainingSeconds <= 0) return 'Chegou';
    return `${Math.max(1, Math.ceil(etaRemainingSeconds / 60))} min`;
  }, [etaRemainingSeconds]);

  const initialRegion = useMemo(
    () => ({
      latitude: (pickupLat + driverLat) / 2,
      longitude: (pickupLon + driverLon) / 2,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }),
    [pickupLat, pickupLon, driverLat, driverLon]
  );

  useEffect(() => {
    const fetchDriverRoute = async () => {
      try {
        const start = `${driverCoordinate.longitude},${driverCoordinate.latitude}`;
        const end = `${pickupCoordinate.longitude},${pickupCoordinate.latitude}`;
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        const coordinates = data?.routes?.[0]?.geometry?.coordinates;
        const resolvedDurationSeconds = USE_MOCK_DRIVER_ARRIVAL_DURATION
          ? MOCK_DRIVER_ARRIVAL_SECONDS
          : Math.max(60, Math.round(data?.routes?.[0]?.duration || fallbackEtaMinutes * 60));

        if (!coordinates || coordinates.length < 2) {
          setDriverRouteCoordinates([driverCoordinate, pickupCoordinate]);
          setRouteEtaSeconds(USE_MOCK_DRIVER_ARRIVAL_DURATION ? MOCK_DRIVER_ARRIVAL_SECONDS : Math.ceil(fallbackEtaMinutes * 60));
          return;
        }

        const parsed = coordinates.map(([longitude, latitude]) => ({ latitude, longitude }));
        setDriverRouteCoordinates(parsed);
        setRouteEtaSeconds(resolvedDurationSeconds);
      } catch (error) {
        setDriverRouteCoordinates([driverCoordinate, pickupCoordinate]);
        setRouteEtaSeconds(USE_MOCK_DRIVER_ARRIVAL_DURATION ? MOCK_DRIVER_ARRIVAL_SECONDS : Math.ceil(fallbackEtaMinutes * 60));
      }
    };

    fetchDriverRoute();
  }, [driverCoordinate, pickupCoordinate, fallbackEtaMinutes]);

  useEffect(() => {
    setMovingDriverCoordinate(driverCoordinate);
  }, [driverCoordinate]);

  useEffect(() => {
    setEtaRemainingSeconds(baseEtaSeconds);
  }, [baseEtaSeconds]);

  useEffect(() => {
    if (driverRouteCoordinates.length < 2) return;
    mapRef.current?.fitToCoordinates(driverRouteCoordinates, {
      edgePadding: { top: 70, right: 60, bottom: 260, left: 60 },
      animated: true,
    });
  }, [driverRouteCoordinates]);

  useEffect(() => {
    if (driverRouteCoordinates.length < 2) return;

    let pointIndex = 0;
    const totalSteps = Math.max(1, driverRouteCoordinates.length - 1);
    const totalEtaSeconds = Math.max(1, baseEtaSeconds);
    const totalDurationMs = totalEtaSeconds * 1000;
    const tickMs = Math.max(40, Math.floor(totalDurationMs / totalSteps));

    const interval = setInterval(() => {
      pointIndex += 1;
      if (pointIndex >= driverRouteCoordinates.length) {
        pointIndex = driverRouteCoordinates.length - 1;
        clearInterval(interval);
      }
      setMovingDriverCoordinate(driverRouteCoordinates[pointIndex]);

      const stepsRemaining = Math.max(0, totalSteps - pointIndex);
      const nextEtaSeconds = Math.ceil((stepsRemaining / totalSteps) * totalEtaSeconds);
      setEtaRemainingSeconds(nextEtaSeconds);
    }, tickMs);

    return () => clearInterval(interval);
  }, [driverRouteCoordinates, baseEtaSeconds]);

  useEffect(() => {
    if (driverRouteCoordinates.length < 2 || hasNavigatedToTripRef.current) return;

    const timer = setTimeout(() => {
      hasNavigatedToTripRef.current = true;
      router.replace({
        pathname: '/delivery-in-transit',
        params: {
          pickupName,
          destinationName,
          deliveryFee,
          estimatedPrice: deliveryFee,
          paymentMethod,
          distanceKm,
          durationMin: durationMinParam,
          itemDescription,
          pickupLat: String(pickupLat),
          pickupLon: String(pickupLon),
          destinationLat: String(destinationLat),
          destinationLon: String(destinationLon),
          categoryId,
          weightTier,
          sizeTier,
        },
      });
    }, baseEtaSeconds * 1000 + 3000);

    return () => clearTimeout(timer);
  }, [
    driverRouteCoordinates.length,
    baseEtaSeconds,
    router,
    pickupName,
    destinationName,
    deliveryFee,
    paymentMethod,
    itemDescription,
    distanceKm,
    pickupLat,
    pickupLon,
    destinationLat,
    destinationLon,
    durationMinParam,
    categoryId,
    weightTier,
    sizeTier,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Entregador a caminho</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.mapContainer}>
        <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} rotateEnabled={false} pitchEnabled={false}>
          <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
          {driverRouteCoordinates.length > 1 ? (
            <Polyline coordinates={driverRouteCoordinates} strokeColor="#28A74580" strokeWidth={6} />
          ) : null}

          <Marker coordinate={pickupCoordinate} title="Origem">
            <View style={styles.pointPin}>
              <Ionicons name="location" size={18} color="#2E7BFF" />
            </View>
          </Marker>

          <Marker coordinate={movingDriverCoordinate} title="Motorista">
            <View style={styles.driverMarkerWrap}>
              <View style={styles.driverPin}>
                <Image source={require('../assets/img/avatar.png')} style={styles.driverPinPhoto} />
              </View>
              <View style={styles.carPinAttached}>
                <Ionicons name="bicycle" size={14} color="#0A2547" />
              </View>
            </View>
          </Marker>
        </MapView>
      </View>

      <View style={styles.bottomCard}>
        <View style={styles.dragger} />

        <View style={styles.driverRow}>
          <Image source={require('../assets/img/avatar.png')} style={styles.driverPhoto} />
          <View style={styles.driverMeta}>
            <Text style={styles.driverName}>Paulo Ernesto</Text>
            <Text style={styles.driverCar}>Bicicleta · entrega Oholo</Text>
            <Text style={styles.driverPlate}>NPL-DLV-102-MZ</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <Text style={styles.etaText}>ETA: {etaDisplay}</Text>
          <Text style={styles.distanceText}>{distanceKm.replace('.', ',')} km</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.actionButton, styles.actionCall]}>
            <Ionicons name="call-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionText}>Ligar</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.actionCancel]} onPress={() => router.replace('/(tabs)')}>
            <Ionicons name="close-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionText}>Cancelar</Text>
          </Pressable>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>O seu entregador vai recolher a encomenda no ponto indicado</Text>
        </View>
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
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  pointPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2E7BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2E7BFF',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  driverPinPhoto: {
    width: '100%',
    height: '100%',
  },
  driverMarkerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carPinAttached: {
    marginTop: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2E7BFF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCard: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 12,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    shadowColor: '#00000033',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
  },
  dragger: {
    alignSelf: 'center',
    width: 46,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E6EAF0',
    marginBottom: 10,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverPhoto: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#E5EAF2',
  },
  driverMeta: {
    marginLeft: 12,
    flex: 1,
  },
  driverName: {
    color: '#0A2547',
    fontSize: 14,
    fontWeight: '800',
  },
  driverCar: {
    marginTop: 2,
    color: '#2A3850',
    fontSize: 14,
    fontWeight: '500',
  },
  driverPlate: {
    marginTop: 2,
    color: '#2A3850',
    fontSize: 14,
    fontWeight: '500',
  },
  metricsRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  etaText: {
    color: '#0A2547',
    fontSize: 22,
    fontWeight: '900',
  },
  distanceText: {
    color: '#2E7BFF',
    fontSize: 22,
    fontWeight: '900',
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionCall: {
    backgroundColor: '#0A2547',
  },
  actionCancel: {
    backgroundColor: '#D64045',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  descriptionCard: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F2',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  descriptionText: {
    color: '#0A2547',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
