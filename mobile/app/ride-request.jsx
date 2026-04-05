import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useKeyboardBottomInset } from '../hooks/useKeyboardBottomInset';

const NAMPULA_REGION = {
  latitude: -15.1165,
  longitude: 39.2666,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};
const NAMPULA_BOUNDS = {
  minLat: -15.22,
  maxLat: -15.02,
  minLon: 39.16,
  maxLon: 39.38,
};

const TRAFFIC_CONFIG = {
  minimumEtaMinutes: 3,
  hourMultipliers: [
    { startHour: 0, endHour: 4, factor: 1.2 },
    { startHour: 5, endHour: 7, factor: 1.4 },
    { startHour: 8, endHour: 10, factor: 2.2 },
    { startHour: 11, endHour: 16, factor: 1.6 },
    { startHour: 17, endHour: 20, factor: 2.8 },
    { startHour: 21, endHour: 23, factor: 1.5 },
  ],
};

export default function RideRequestScreen() {
  const router = useRouter();
  const keyboardBottom = useKeyboardBottomInset();
  const mapRef = useRef(null);
  const [pickupCoordinate, setPickupCoordinate] = useState(null);
  const [destinationCoordinate, setDestinationCoordinate] = useState(null);
  const [pickupName, setPickupName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [selectionMode, setSelectionMode] = useState('pickup');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeDistanceKm, setRouteDistanceKm] = useState(0);
  const [routeDurationMin, setRouteDurationMin] = useState(0);
  const [mapRegion, setMapRegion] = useState(NAMPULA_REGION);
  const [pickupQuery, setPickupQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [searchingTarget, setSearchingTarget] = useState(null);

  const isInsideNampula = (coordinate) =>
    coordinate.latitude >= NAMPULA_BOUNDS.minLat &&
    coordinate.latitude <= NAMPULA_BOUNDS.maxLat &&
    coordinate.longitude >= NAMPULA_BOUNDS.minLon &&
    coordinate.longitude <= NAMPULA_BOUNDS.maxLon;

  const getTrafficMultiplierByHour = () => {
    const currentHour = new Date().getHours();
    const matched = TRAFFIC_CONFIG.hourMultipliers.find(
      (item) => currentHour >= item.startHour && currentHour <= item.endHour
    );
    return matched?.factor || 1.6;
  };

  const resolvePlaceName = async (coordinate, target) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinate.latitude}&lon=${coordinate.longitude}`
      );
      const data = await response.json();
      const label = data?.display_name || '';
      if (!label) return;

      if (target === 'pickup') {
        setPickupName(label);
        setPickupQuery(label);
      } else {
        setDestinationName(label);
        setDestinationQuery(label);
      }
    } catch (error) {
      // Ignore reverse geocoding failures to keep flow working.
    }
  };

  const handleMapPress = async (event) => {
    const coordinate = event.nativeEvent.coordinate;
    if (!isInsideNampula(coordinate)) {
      Alert.alert('Fora de Nampula', 'Selecione um ponto dentro da cidade de Nampula.');
      return;
    }

    if (selectionMode === 'pickup') {
      setPickupCoordinate(coordinate);
      setPickupName('');
      setDestinationCoordinate(null);
      setDestinationName('');
      setDestinationQuery('');
      setRouteCoordinates([]);
      setRouteDistanceKm(0);
      setRouteDurationMin(0);
      setSelectionMode('destination');
      await resolvePlaceName(coordinate, 'pickup');
      return;
    }
    setDestinationCoordinate(coordinate);
    setDestinationName('');
    await resolvePlaceName(coordinate, 'destination');
  };

  const searchPlace = async (target) => {
    const query = (target === 'pickup' ? pickupQuery : destinationQuery).trim();
    if (!query) {
      Alert.alert('Busca vazia', 'Escreva um local para pesquisar.');
      return;
    }

    setSearchingTarget(target);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=mz&bounded=1&viewbox=${NAMPULA_BOUNDS.minLon},${NAMPULA_BOUNDS.maxLat},${NAMPULA_BOUNDS.maxLon},${NAMPULA_BOUNDS.minLat}&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      const first = data?.[0];

      if (!first) {
        Alert.alert('Local nao encontrado', 'Tente outro nome de local.');
        return;
      }

      const coordinate = {
        latitude: Number(first.lat),
        longitude: Number(first.lon),
      };
      if (!isInsideNampula(coordinate)) {
        Alert.alert('Fora de Nampula', 'Use um local dentro da cidade de Nampula.');
        return;
      }

      if (target === 'pickup') {
        setPickupCoordinate(coordinate);
        setPickupName(first.display_name || query);
        setPickupQuery(first.display_name || query);
        setDestinationCoordinate(null);
        setDestinationName('');
        setDestinationQuery('');
        setRouteCoordinates([]);
        setRouteDistanceKm(0);
        setRouteDurationMin(0);
        setSelectionMode('destination');
      } else {
        setDestinationCoordinate(coordinate);
        setDestinationName(first.display_name || query);
        setDestinationQuery(first.display_name || query);
      }

      mapRef.current?.animateToRegion(
        {
          ...coordinate,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        600
      );
    } catch (error) {
      Alert.alert('Erro na busca', 'Nao foi possivel pesquisar este local.');
    } finally {
      setSearchingTarget(null);
    }
  };

  useEffect(() => {
    const initializeFromCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const currentCoordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        const currentRegion = {
          ...currentCoordinate,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        };

        setMapRegion(currentRegion);
        setPickupCoordinate(currentCoordinate);
        await resolvePlaceName(currentCoordinate, 'pickup');
        setSelectionMode('destination');
        mapRef.current?.animateToRegion(currentRegion, 700);
      } catch (error) {
        // Keep fallback region when location is unavailable.
      }
    };

    initializeFromCurrentLocation();
  }, []);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!pickupCoordinate || !destinationCoordinate) {
        return;
      }

      try {
        const start = `${pickupCoordinate.longitude},${pickupCoordinate.latitude}`;
        const end = `${destinationCoordinate.longitude},${destinationCoordinate.latitude}`;
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        const route = data?.routes?.[0];
        const coordinates = route?.geometry?.coordinates;

        if (!coordinates || coordinates.length === 0) {
          setRouteCoordinates([]);
          setRouteDistanceKm(0);
          setRouteDurationMin(0);
          return;
        }

        const parsed = coordinates.map(([longitude, latitude]) => ({ latitude, longitude }));
        setRouteCoordinates(parsed);
        setRouteDistanceKm((route.distance || 0) / 1000);
        const baseMinutes = (route.duration || 0) / 60;
        const trafficMultiplier = getTrafficMultiplierByHour();
        const adjustedMinutes = Math.max(TRAFFIC_CONFIG.minimumEtaMinutes, baseMinutes * trafficMultiplier);
        setRouteDurationMin(adjustedMinutes);

        mapRef.current?.fitToCoordinates(parsed, {
          edgePadding: { top: 80, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
      } catch (error) {
        setRouteCoordinates([]);
        setRouteDistanceKm(0);
        setRouteDurationMin(0);
        Alert.alert('Rota indisponivel', 'Nao foi possivel calcular a rota neste momento.');
      }
    };

    fetchRoute();
  }, [pickupCoordinate, destinationCoordinate]);

  const handleGoToRideConfirm = () => {
    if (!pickupCoordinate || !destinationCoordinate) {
      Alert.alert('Faltam dados', 'Defina ponto de recolha e destino para continuar.');
      return;
    }

    router.push({
      pathname: '/ride-confirm',
      params: {
        pickupName:
          pickupName || `${pickupCoordinate.latitude.toFixed(5)}, ${pickupCoordinate.longitude.toFixed(5)}`,
        destinationName:
          destinationName || `${destinationCoordinate.latitude.toFixed(5)}, ${destinationCoordinate.longitude.toFixed(5)}`,
        distanceKm: routeDistanceKm.toFixed(1),
        durationMin: Math.max(1, Math.round(routeDurationMin)).toString(),
        pickupLat: pickupCoordinate.latitude.toString(),
        pickupLon: pickupCoordinate.longitude.toString(),
        destinationLat: destinationCoordinate.latitude.toString(),
        destinationLon: destinationCoordinate.longitude.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.navigate('/(tabs)')} hitSlop={10}>
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Pedir corrida</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.mapArea}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={mapRegion}
            onPress={handleMapPress}
            rotateEnabled={false}
            pitchEnabled={false}
            showsUserLocation
            showsMyLocationButton
          >
            <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />

            {pickupCoordinate ? (
              <Marker coordinate={pickupCoordinate} title="Ponto de recolha">
                <Ionicons name="location" size={38} color="#006AFF" />
              </Marker>
            ) : null}

            {destinationCoordinate ? (
              <Marker coordinate={destinationCoordinate} title="Destino">
                <Ionicons name="location" size={38} color="#E04F5F" />
              </Marker>
            ) : null}

            {routeCoordinates.length > 1 ? (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#2E7BFF"
                strokeWidth={4}
              />
            ) : null}
          </MapView>
        </View>

        <View style={[styles.bottomSheet, { bottom: keyboardBottom }]}>
          <View style={styles.dragger} />

          <View style={[styles.fieldRow, selectionMode === 'pickup' && styles.activeField]}>
            <Ionicons name="location-outline" size={22} color="#0A2547" />
            <View style={styles.fieldCopy}>
              <Text style={styles.fieldTitle}>Ponto de recolha</Text>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ex.: Estadio do Nampula"
                  placeholderTextColor="#8A97A8"
                  value={pickupQuery}
                  onChangeText={setPickupQuery}
                  onFocus={() => setSelectionMode('pickup')}
                  onSubmitEditing={() => searchPlace('pickup')}
                  returnKeyType="search"
                />
                <Pressable style={styles.searchButton} onPress={() => searchPlace('pickup')}>
                  {searchingTarget === 'pickup' ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="search" size={16} color="#FFFFFF" />
                  )}
                </Pressable>
              </View>
              <Text style={styles.fieldSubtitle}>
                {pickupCoordinate
                  ? pickupName || `${pickupCoordinate.latitude.toFixed(5)}, ${pickupCoordinate.longitude.toFixed(5)}`
                  : 'Toque no mapa para escolher'}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={[styles.fieldRow, selectionMode === 'destination' && styles.activeField]}>
            <Ionicons name="navigate-circle-outline" size={22} color="#0A2547" />
            <View style={styles.fieldCopy}>
              <Text style={styles.fieldTitle}>Destino</Text>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ex.: Aeroporto de Nampula"
                  placeholderTextColor="#8A97A8"
                  value={destinationQuery}
                  onChangeText={setDestinationQuery}
                  onFocus={() => setSelectionMode('destination')}
                  onSubmitEditing={() => searchPlace('destination')}
                  returnKeyType="search"
                />
                <Pressable style={styles.searchButton} onPress={() => searchPlace('destination')}>
                  {searchingTarget === 'destination' ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="search" size={16} color="#FFFFFF" />
                  )}
                </Pressable>
              </View>
              <Text style={styles.fieldSubtitle}>
                {destinationCoordinate
                  ? destinationName || `${destinationCoordinate.latitude.toFixed(5)}, ${destinationCoordinate.longitude.toFixed(5)}`
                  : 'Toque no mapa para escolher'}
              </Text>
            </View>
          </View>

          <Pressable style={styles.estimateButton} onPress={handleGoToRideConfirm}>
            <Text style={styles.estimateText}>Ver estimativa</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </Pressable>
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
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
    position: 'relative',
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
  mapArea: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    minHeight: 255,
    shadowColor: '#00000024',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  dragger: {
    width: 52,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D8DEE8',
    alignSelf: 'center',
    marginBottom: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  activeField: {
    borderWidth: 1.5,
    borderColor: '#2B63B8',
    borderRadius: 10,
    paddingTop: 12,
    paddingBottom: 14,
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  fieldCopy: {
    flex: 1,
  },
  fieldTitle: {
    color: '#0A2547',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  fieldSubtitle: {
    color: '#5F7088',
    fontSize: 12,
    lineHeight: 18,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4DEEA',
    backgroundColor: '#F8FBFF',
    paddingHorizontal: 10,
    color: '#0A2547',
    fontSize: 14,
  },
  searchButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#006AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#E4EAF2',
    marginLeft: 34,
  },
  estimateButton: {
    height: 56,
    borderRadius: 10,
    backgroundColor: '#0A2547',
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#006AFF66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  estimateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
