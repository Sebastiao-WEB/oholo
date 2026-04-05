import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const NAMPULA_REGION = {
  latitude: -15.1165,
  longitude: 39.2666,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function RideSearchingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef(null);
  const radarAnim = useRef(new Animated.Value(0)).current;
  const [isDriverAssigned, setIsDriverAssigned] = useState(false);

  const pickupName = String(params.pickupName || 'Mercado Central');
  const destinationName = String(params.destinationName || 'Hospital Central');
  const rideType = String(params.rideType || 'Económica');
  const estimatedPrice = String(params.estimatedPrice || '23');
  const paymentMethod = String(params.paymentMethod || 'M-Pesa');
  const etaMin = String(params.etaMin || '3 min');
  const distanceKm = String(params.distanceKm || '1,2');

  const pickupLat = Number(params.pickupLat || NAMPULA_REGION.latitude - 0.01);
  const pickupLon = Number(params.pickupLon || NAMPULA_REGION.longitude - 0.01);
  const destinationLat = Number(params.destinationLat || NAMPULA_REGION.latitude + 0.008);
  const destinationLon = Number(params.destinationLon || NAMPULA_REGION.longitude + 0.012);

  const pickupCoordinate = useMemo(
    () => ({ latitude: pickupLat, longitude: pickupLon }),
    [pickupLat, pickupLon]
  );
  const destinationCoordinate = useMemo(
    () => ({ latitude: destinationLat, longitude: destinationLon }),
    [destinationLat, destinationLon]
  );
  const [routeCoordinates, setRouteCoordinates] = useState([pickupCoordinate, destinationCoordinate]);
  const [driverRouteCoordinates, setDriverRouteCoordinates] = useState([]);

  const initialRegion = useMemo(
    () => ({
      latitude: pickupCoordinate.latitude,
      longitude: pickupCoordinate.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }),
    [pickupCoordinate.latitude, pickupCoordinate.longitude]
  );

  useEffect(() => {
    const radarLoop = Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    radarLoop.start();

    const assignTimer = setTimeout(() => {
      setIsDriverAssigned(true);
      radarLoop.stop();
    }, 7000);

    return () => {
      clearTimeout(assignTimer);
      radarLoop.stop();
    };
  }, [radarAnim]);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const start = `${pickupCoordinate.longitude},${pickupCoordinate.latitude}`;
        const end = `${destinationCoordinate.longitude},${destinationCoordinate.latitude}`;
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        const coordinates = data?.routes?.[0]?.geometry?.coordinates;

        if (!coordinates || coordinates.length < 2) {
          setRouteCoordinates([pickupCoordinate, destinationCoordinate]);
          return;
        }

        const parsed = coordinates.map(([longitude, latitude]) => ({ latitude, longitude }));
        setRouteCoordinates(parsed);
        mapRef.current?.fitToCoordinates(parsed, {
          edgePadding: { top: 80, right: 60, bottom: 280, left: 60 },
          animated: true,
        });
      } catch (error) {
        setRouteCoordinates([pickupCoordinate, destinationCoordinate]);
      }
    };

    fetchRoute();
  }, [pickupCoordinate, destinationCoordinate]);

  const carMarkers = useMemo(
    () => [
      { latitude: pickupLat - 0.007, longitude: pickupLon - 0.008 },
      { latitude: pickupLat + 0.003, longitude: pickupLon + 0.01 },
      { latitude: destinationLat + 0.004, longitude: destinationLon - 0.009 },
      { latitude: destinationLat - 0.009, longitude: destinationLon + 0.006 },
    ],
    [pickupLat, pickupLon, destinationLat, destinationLon]
  );

  const nearestDriver = useMemo(() => {
    if (!carMarkers.length) return null;
    const distance = (a, b) => Math.hypot(a.latitude - b.latitude, a.longitude - b.longitude);
    return carMarkers.reduce((nearest, current) =>
      distance(current, pickupCoordinate) < distance(nearest, pickupCoordinate) ? current : nearest
    );
  }, [carMarkers, pickupCoordinate]);

  useEffect(() => {
    const fetchNearestDriverRoute = async () => {
      if (!nearestDriver || !isDriverAssigned) return;
      setDriverRouteCoordinates([nearestDriver, pickupCoordinate]);

      try {
        const start = `${nearestDriver.longitude},${nearestDriver.latitude}`;
        const end = `${pickupCoordinate.longitude},${pickupCoordinate.latitude}`;
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        const coordinates = data?.routes?.[0]?.geometry?.coordinates;

        if (!coordinates || coordinates.length < 2) {
          setDriverRouteCoordinates([nearestDriver, pickupCoordinate]);
          return;
        }

        const parsed = coordinates.map(([longitude, latitude]) => ({ latitude, longitude }));
        setDriverRouteCoordinates(parsed);
      } catch (error) {
        setDriverRouteCoordinates([nearestDriver, pickupCoordinate]);
      }
    };

    fetchNearestDriverRoute();
  }, [nearestDriver, pickupCoordinate, isDriverAssigned]);

  useEffect(() => {
    const allCoordinates = [...routeCoordinates, ...driverRouteCoordinates];
    if (allCoordinates.length < 2) return;

    mapRef.current?.fitToCoordinates(allCoordinates, {
      edgePadding: { top: 80, right: 60, bottom: 300, left: 60 },
      animated: true,
    });
  }, [routeCoordinates, driverRouteCoordinates]);

  useEffect(() => {
    if (!isDriverAssigned) return;
    if (!nearestDriver) return;

    const timer = setTimeout(() => {
      router.push({
        pathname: '/ride-in-progress',
        params: {
          pickupName,
          destinationName,
          rideType,
          estimatedPrice,
          paymentMethod,
          etaMin,
          distanceKm,
          pickupLat: String(pickupLat),
          pickupLon: String(pickupLon),
          destinationLat: String(destinationLat),
          destinationLon: String(destinationLon),
          driverLat: String(nearestDriver.latitude),
          driverLon: String(nearestDriver.longitude),
        },
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [
    isDriverAssigned,
    router,
    pickupName,
    destinationName,
    rideType,
    estimatedPrice,
    paymentMethod,
    etaMin,
    distanceKm,
    nearestDriver,
    pickupLat,
    pickupLon,
    destinationLat,
    destinationLon,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Buscando motorista</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />

          <Marker coordinate={pickupCoordinate} title="Origem">
            <View style={styles.userMarkerWrap}>
              {!isDriverAssigned ? (
                <>
                  <Animated.View
                    style={[
                      styles.radarRing,
                      {
                        transform: [{ scale: radarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.9] }) }],
                        opacity: radarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.radarRingSecondary,
                      {
                        transform: [{ scale: radarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.6] }) }],
                        opacity: radarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
                      },
                    ]}
                  />
                </>
              ) : (
                <View style={styles.userMarkerHalo} />
              )}
              <View style={styles.userMarker}>
                <Ionicons name="person" size={14} color="#FFFFFF" />
              </View>
            </View>
          </Marker>

          <Marker coordinate={destinationCoordinate} title="Destino">
            <View style={[styles.pointBubble, styles.pointBubbleB]}>
              <Text style={styles.pointText}>B</Text>
            </View>
          </Marker>

          {carMarkers.map((car, index) => (
            <Marker key={index} coordinate={car}>
              <View style={[styles.carDot, isDriverAssigned && nearestDriver === car && styles.carDotNearest]}>
                <Ionicons
                  name="car-sport"
                  size={12}
                  color={isDriverAssigned && nearestDriver === car ? '#1E8E3E' : '#1A87E6'}
                />
              </View>
            </Marker>
          ))}

          <Polyline coordinates={routeCoordinates} strokeColor="#0A2547" strokeWidth={5} />
          {isDriverAssigned && driverRouteCoordinates.length > 1 ? (
            <Polyline coordinates={driverRouteCoordinates} strokeColor="#28A74580" strokeWidth={6} />
          ) : null}
        </MapView>
      </View>

      <View style={styles.bottomCard}>
        <Text style={styles.title}>Estamos a procurar um motorista próximo</Text>
        <Text style={styles.subtitle}>
          {isDriverAssigned
            ? 'O sistema está a procurar a melhor opção entre os motoristas disponíveis.'
            : 'Aguarde alguns instantes enquanto localizamos a melhor opção para a sua corrida.'}
        </Text>
        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Origem:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {pickupName}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Destino:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {destinationName}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tipo:</Text>
          <Text style={styles.infoValue}>{rideType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estimativa:</Text>
          <Text style={styles.infoValue}>{estimatedPrice} MT</Text>
        </View>

        <Pressable style={styles.cancelButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.cancelText}>Cancelar pedido</Text>
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
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  userMarkerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerHalo: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2E7BFF44',
  },
  radarRing: {
    position: 'absolute',
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: '#0A254766',
  },
  radarRingSecondary: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#0A254759',
  },
  userMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2E7BFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pointBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0A2547',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pointBubbleB: {
    backgroundColor: '#102E5E',
  },
  pointText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  carDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DFF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#96CCFF',
  },
  carDotNearest: {
    backgroundColor: '#E8F8EE',
    borderColor: '#7FD4A0',
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    shadowColor: '#0000002A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 9,
    elevation: 5,
  },
  title: {
    color: '#0A2547',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  subtitle: {
    marginTop: 6,
    color: '#5D6D84',
    fontSize: 14,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5EAF2',
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  infoLabel: {
    width: 70,
    color: '#65758B',
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    color: '#1F2F47',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#D64045',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
