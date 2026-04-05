import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const USE_MOCK_TRIP_DURATION = __DEV__;
const MOCK_TRIP_DURATION_SECONDS = 20;

export default function DeliveryInTransitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef(null);
  const hasNavigatedToCompletedRef = useRef(false);

  const pickupName = String(params.pickupName || 'Origem');
  const destinationName = String(params.destinationName || 'Destino');
  const deliveryFee = String(params.deliveryFee || params.estimatedPrice || '0');
  const paymentMethod = String(params.paymentMethod || 'Dinheiro');
  const itemDescription = String(params.itemDescription || '');
  const distanceKm = String(params.distanceKm || '3,2');
  const categoryId = String(params.categoryId || 'documents');
  const pickupLat = Number(params.pickupLat || -15.1234);
  const pickupLon = Number(params.pickupLon || 39.2612);
  const destinationLat = Number(params.destinationLat || -15.1096);
  const destinationLon = Number(params.destinationLon || 39.2864);

  const pickupCoordinate = useMemo(
    () => ({ latitude: pickupLat, longitude: pickupLon }),
    [pickupLat, pickupLon]
  );
  const destinationCoordinate = useMemo(
    () => ({ latitude: destinationLat, longitude: destinationLon }),
    [destinationLat, destinationLon]
  );

  const [tripRouteCoordinates, setTripRouteCoordinates] = useState([pickupCoordinate, destinationCoordinate]);
  const [movingCoordinate, setMovingCoordinate] = useState(pickupCoordinate);
  const [tripEtaSeconds, setTripEtaSeconds] = useState(300);
  const [etaRemainingSeconds, setEtaRemainingSeconds] = useState(300);

  const etaDisplay = useMemo(() => {
    if (etaRemainingSeconds <= 0) return 'Chegou';
    return `${Math.max(1, Math.ceil(etaRemainingSeconds / 60))} min`;
  }, [etaRemainingSeconds]);

  useEffect(() => {
    const fetchTripRoute = async () => {
      try {
        const start = `${pickupCoordinate.longitude},${pickupCoordinate.latitude}`;
        const end = `${destinationCoordinate.longitude},${destinationCoordinate.latitude}`;
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        const coordinates = data?.routes?.[0]?.geometry?.coordinates;
        const durationSec = Math.round(data?.routes?.[0]?.duration || 300);
        const resolvedDurationSeconds = USE_MOCK_TRIP_DURATION ? MOCK_TRIP_DURATION_SECONDS : Math.max(120, durationSec);

        if (!coordinates || coordinates.length < 2) {
          setTripRouteCoordinates([pickupCoordinate, destinationCoordinate]);
          const fallback = USE_MOCK_TRIP_DURATION ? MOCK_TRIP_DURATION_SECONDS : 300;
          setTripEtaSeconds(fallback);
          setEtaRemainingSeconds(fallback);
          return;
        }

        const parsed = coordinates.map(([longitude, latitude]) => ({ latitude, longitude }));
        setTripRouteCoordinates(parsed);
        setTripEtaSeconds(resolvedDurationSeconds);
        setEtaRemainingSeconds(resolvedDurationSeconds);
        setMovingCoordinate(parsed[0]);
      } catch (error) {
        setTripRouteCoordinates([pickupCoordinate, destinationCoordinate]);
        const fallback = USE_MOCK_TRIP_DURATION ? MOCK_TRIP_DURATION_SECONDS : 300;
        setTripEtaSeconds(fallback);
        setEtaRemainingSeconds(fallback);
      }
    };

    fetchTripRoute();
  }, [pickupCoordinate, destinationCoordinate]);

  useEffect(() => {
    if (tripRouteCoordinates.length < 2) return;
    mapRef.current?.fitToCoordinates(tripRouteCoordinates, {
      edgePadding: { top: 90, right: 60, bottom: 290, left: 60 },
      animated: true,
    });
  }, [tripRouteCoordinates]);

  useEffect(() => {
    if (tripRouteCoordinates.length < 2) return;

    let pointIndex = 0;
    const totalSteps = Math.max(1, tripRouteCoordinates.length - 1);
    const tickMs = Math.max(140, Math.floor((tripEtaSeconds * 1000) / totalSteps));

    const interval = setInterval(() => {
      pointIndex += 1;
      if (pointIndex >= tripRouteCoordinates.length) {
        pointIndex = tripRouteCoordinates.length - 1;
        clearInterval(interval);
      }
      setMovingCoordinate(tripRouteCoordinates[pointIndex]);
      const stepsRemaining = Math.max(0, totalSteps - pointIndex);
      const nextEta = Math.ceil((stepsRemaining / totalSteps) * tripEtaSeconds);
      setEtaRemainingSeconds(nextEta);
    }, tickMs);

    return () => clearInterval(interval);
  }, [tripRouteCoordinates, tripEtaSeconds]);

  useEffect(() => {
    if (etaRemainingSeconds > 0 || hasNavigatedToCompletedRef.current) return;
    hasNavigatedToCompletedRef.current = true;

    const totalMinutes = Math.max(1, Math.ceil(tripEtaSeconds / 60));
    const safeDistance = distanceKm.replace('.', ',');

    const timer = setTimeout(() => {
      router.replace({
        pathname: '/delivery-completed',
        params: {
          pickupName,
          destinationName,
          deliveryFee,
          estimatedPrice: deliveryFee,
          paymentMethod,
          itemDescription,
          serviceLabel: 'Delivery',
          categoryId,
          totalTimeMin: String(totalMinutes),
          distanceKm: safeDistance,
          pickupLat: String(pickupLat),
          pickupLon: String(pickupLon),
          destinationLat: String(destinationLat),
          destinationLon: String(destinationLon),
        },
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    etaRemainingSeconds,
    tripEtaSeconds,
    distanceKm,
    router,
    pickupName,
    destinationName,
    deliveryFee,
    paymentMethod,
    itemDescription,
    categoryId,
    pickupLat,
    pickupLon,
    destinationLat,
    destinationLon,
  ]);

  const handleShareLocation = async () => {
    try {
      await Share.share({
        message: `Delivery Oholo a caminho de ${destinationName}. Localização: https://maps.google.com/?q=${movingCoordinate.latitude},${movingCoordinate.longitude}`,
      });
    } catch (error) {
      Alert.alert('Não foi possível partilhar', 'Tente novamente em alguns instantes.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Delivery em trânsito</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.mapContainer}>
        <MapView ref={mapRef} style={styles.map} initialRegion={{
          latitude: (pickupLat + destinationLat) / 2,
          longitude: (pickupLon + destinationLon) / 2,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}>
          <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />

          <Polyline coordinates={tripRouteCoordinates} strokeColor="#3A84FF" strokeWidth={5} />

          <Marker coordinate={pickupCoordinate} title="Origem">
            <View style={styles.pointMarker}>
              <Ionicons name="location" size={16} color="#2E7BFF" />
            </View>
          </Marker>

          <Marker coordinate={destinationCoordinate} title="Destino">
            <View style={styles.pointMarker}>
              <Ionicons name="flag" size={15} color="#0A2547" />
            </View>
          </Marker>

          <Marker coordinate={movingCoordinate} title="Entregador">
            <View style={styles.carMarker}>
              <Ionicons name="bicycle" size={16} color="#FFFFFF" />
            </View>
          </Marker>
        </MapView>
      </View>

      <View style={styles.bottomCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>ETA de entrega</Text>
          <Text style={styles.etaValue}>{etaDisplay}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.routeInfo}>
          <Text style={styles.routeLabel}>Recolha</Text>
          <Text style={styles.routeValue} numberOfLines={1}>{pickupName}</Text>
          <Text style={styles.routeLabel}>Entrega</Text>
          <Text style={styles.routeValue} numberOfLines={1}>{destinationName}</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.actionButton, styles.shareButton]} onPress={handleShareLocation}>
            <Ionicons name="share-social-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionText}>Partilhar localização</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={() => router.replace('/(tabs)')}>
            <Ionicons name="close-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionText}>Cancelar localização</Text>
          </Pressable>
        </View>
      </View>
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSpacer: { width: 26 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  pointMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2E7BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0A2547',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bottomCard: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#0000002A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: '#5D6D84',
    fontSize: 14,
    fontWeight: '600',
  },
  etaValue: {
    color: '#0A2547',
    fontSize: 20,
    fontWeight: '900',
  },
  separator: {
    height: 1,
    backgroundColor: '#E3E9F2',
    marginVertical: 10,
  },
  routeInfo: {
    gap: 2,
  },
  routeLabel: {
    color: '#6A7789',
    fontSize: 12,
    fontWeight: '600',
  },
  routeValue: {
    color: '#1F2F47',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5,
  },
  actionsRow: {
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareButton: {
    backgroundColor: '#006AFF',
  },
  cancelButton: {
    backgroundColor: '#D64045',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
