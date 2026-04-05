import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { labelForDeliveryCategory } from '../utils/deliveryPricing';

const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/** Alinhar com `mapSidePanel.width` em estilos (50% = 0.5). */
const SIDE_PANEL_WIDTH_RATIO = 0.5;

function parseCoord(value) {
  if (value === undefined || value === null) return Number.NaN;
  const s = String(value).trim();
  if (s === '') return Number.NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : Number.NaN;
}

/** Garante que o traçado começa no pin de recolha e termina no pin de entrega. */
function routeLinkingMarkers(osrmCoords, pickup, destination) {
  if (!osrmCoords || osrmCoords.length < 2) {
    return [
      { latitude: pickup.latitude, longitude: pickup.longitude },
      { latitude: destination.latitude, longitude: destination.longitude },
    ];
  }
  const pts = osrmCoords.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
  pts[0] = { latitude: pickup.latitude, longitude: pickup.longitude };
  pts[pts.length - 1] = { latitude: destination.latitude, longitude: destination.longitude };
  return pts;
}

export default function DeliveryCompletedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef(null);
  const [mapLayout, setMapLayout] = useState({ width: 0, height: 0 });

  const pickupName = String(params.pickupName || 'Mercado Central');
  const destinationName = String(params.destinationName || 'Hospital Central');
  const deliveryFee = String(params.deliveryFee || params.estimatedPrice || '0');
  const totalTimeMin = String(params.totalTimeMin || '18');
  const distanceKm = String(params.distanceKm || '4,5');
  const paymentMethod = String(params.paymentMethod || 'M-Pesa');
  const itemDescription = String(params.itemDescription || 'Envelope pequeno');
  const categoryId = String(params.categoryId || 'documents');
  const referenceNote = String(
    params.deliveryReference || params.referenceNote || 'Perto do ponto de entrega'
  );

  const riderName = String(params.riderName || 'Mário Salimo');
  const riderVehicle = String(params.riderVehicle || 'Mota azul');
  const riderPlate = String(params.riderPlate || 'NPL-45-112-MZ');

  const pickupLat = parseCoord(params.pickupLat);
  const pickupLon = parseCoord(params.pickupLon);
  const destinationLat = parseCoord(params.destinationLat);
  const destinationLon = parseCoord(params.destinationLon);

  const pickupCoord = useMemo(() => {
    const ok = Number.isFinite(pickupLat) && Number.isFinite(pickupLon);
    return ok ? { latitude: pickupLat, longitude: pickupLon } : { latitude: -15.1234, longitude: 39.2612 };
  }, [pickupLat, pickupLon]);

  const destinationCoord = useMemo(() => {
    const ok = Number.isFinite(destinationLat) && Number.isFinite(destinationLon);
    return ok
      ? { latitude: destinationLat, longitude: destinationLon }
      : { latitude: -15.1096, longitude: 39.2864 };
  }, [destinationLat, destinationLon]);

  const miniMapRegion = useMemo(() => {
    const lat = (pickupCoord.latitude + destinationCoord.latitude) / 2;
    const lon = (pickupCoord.longitude + destinationCoord.longitude) / 2;
    const latDelta = Math.max(Math.abs(pickupCoord.latitude - destinationCoord.latitude) * 2.8, 0.012);
    const lonDelta = Math.max(Math.abs(pickupCoord.longitude - destinationCoord.longitude) * 2.8, 0.012);
    return { latitude: lat, longitude: lon, latitudeDelta: latDelta, longitudeDelta: lonDelta };
  }, [pickupCoord, destinationCoord]);

  const [osrmCoordinates, setOsrmCoordinates] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchRoute = async () => {
      try {
        const start = `${pickupCoord.longitude},${pickupCoord.latitude}`;
        const end = `${destinationCoord.longitude},${destinationCoord.latitude}`;
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        const coordinates = data?.routes?.[0]?.geometry?.coordinates;
        if (cancelled) return;
        if (!coordinates || coordinates.length < 2) {
          setOsrmCoordinates(null);
          return;
        }
        const parsed = coordinates.map(([longitude, latitude]) => ({ latitude, longitude }));
        setOsrmCoordinates(parsed);
      } catch {
        if (!cancelled) setOsrmCoordinates(null);
      }
    };
    setOsrmCoordinates(null);
    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [pickupCoord, destinationCoord]);

  const routePolyline = useMemo(
    () => routeLinkingMarkers(osrmCoordinates, pickupCoord, destinationCoord),
    [osrmCoordinates, pickupCoord, destinationCoord]
  );

  const itemTypeLabel = labelForDeliveryCategory(categoryId);
  const descriptionDisplay = itemDescription.trim() || '—';

  const fitRouteInRightHalf = useCallback(() => {
    const { width } = mapLayout;
    if (width < 8 || !mapRef.current) return;
    const leftPad = Math.round(width * SIDE_PANEL_WIDTH_RATIO) + 6;
    mapRef.current.fitToCoordinates(routePolyline, {
      edgePadding: { top: 10, right: 12, bottom: 10, left: leftPad },
      animated: false,
    });
  }, [mapLayout.width, routePolyline]);

  useEffect(() => {
    fitRouteInRightHalf();
  }, [fitRouteInRightHalf]);

  const handleMapSectionLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    setMapLayout((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }, []);

  const handleMapReady = useCallback(() => {
    requestAnimationFrame(() => fitRouteInRightHalf());
  }, [fitRouteInRightHalf]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(tabs)')} hitSlop={12} accessibilityRole="button">
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Delivery concluído</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successBlock}>
          <View style={styles.checkIconWrap}>
            <Ionicons name="checkmark" size={44} color="#1E67FF" />
          </View>
          <Text style={styles.successTitle}>A sua entrega foi concluída com sucesso</Text>
        </View>

        <View style={styles.routeCard}>
          <View style={styles.mapSection} onLayout={handleMapSectionLayout}>
            <MapView
              ref={mapRef}
              style={styles.routeMap}
              initialRegion={miniMapRegion}
              onMapReady={handleMapReady}
              scrollEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              zoomEnabled={false}
              toolbarEnabled={false}
              pointerEvents="none"
            >
              <UrlTile urlTemplate={OSM_URL} maximumZ={19} flipY={false} />
              <Polyline
                coordinates={routePolyline}
                strokeColor="#0A1D37"
                strokeWidth={3}
                lineJoin="round"
                lineCap="round"
              />
              <Marker coordinate={pickupCoord} anchor={{ x: 0.5, y: 1 }}>
                <View style={styles.mapPinPickup}>
                  <Ionicons name="location" size={12} color="#FFFFFF" />
                </View>
              </Marker>
              <Marker coordinate={destinationCoord} anchor={{ x: 0.5, y: 1 }}>
                <View style={styles.mapPinDrop}>
                  <Ionicons name="location" size={12} color="#FFFFFF" />
                </View>
              </Marker>
            </MapView>

            <View style={styles.mapSidePanel} pointerEvents="box-none">
              <ScrollView
                style={styles.sideScroll}
                contentContainerStyle={styles.sideScrollContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                <View style={styles.sideBlock}>
                  <View style={styles.sideStopsRow}>
                    <View style={styles.sidePinRail} collapsable={false}>
                      <View style={styles.pinPickup}>
                        <Ionicons name="location" size={9} color="#FFFFFF" />
                      </View>
                      <View style={styles.sidePinRailFlexGap} />
                      <View style={styles.pinDropoff}>
                        <Ionicons name="location" size={9} color="#FFFFFF" />
                      </View>
                    </View>
                    <View style={styles.sideStopsTextCol}>
                      <View style={[styles.sideStopTextBlock, styles.sideStopTextBlockRecolha]}>
                        <Text style={styles.routeMuted}>Ponto de recolha</Text>
                        <Text style={styles.routeStrong}>{pickupName}</Text>
                      </View>
                      <View style={styles.sideStopTextBlock}>
                        <Text style={styles.routeMuted}>Ponto de entrega</Text>
                        <Text style={styles.routeStrong}>{destinationName}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={[styles.sideBlock, styles.sideBlockGap]}>
                  <View style={styles.sideHeaderRow}>
                    <View style={styles.pinRef}>
                      <Ionicons name="information-circle-outline" size={11} color="#0A1D37" />
                    </View>
                    <View style={styles.sideTextCol}>
                      <Text style={styles.routeMuted}>Referência</Text>
                      <Text style={styles.referenceValue}>{referenceNote}</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Item</Text>
        <View style={styles.itemCard}>
          <View style={styles.itemCol}>
            <Text style={styles.itemLabel}>Tipo:</Text>
            <Text style={styles.itemValue}>{itemTypeLabel}</Text>
          </View>
          <View style={styles.itemDivider} />
          <View style={styles.itemCol}>
            <Text style={styles.itemLabel}>Descrição:</Text>
            <Text style={styles.itemValue}>{descriptionDisplay}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Delivery details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailsRow}>
            <View style={styles.detailsCell}>
              <Text style={styles.detailsLabel}>Valor final:</Text>
              <Text style={styles.detailsValue}>{deliveryFee} MT</Text>
            </View>
            <View style={styles.detailsCell}>
              <Text style={styles.detailsLabel}>Tempo total:</Text>
              <Text style={styles.detailsValue}>{totalTimeMin} min</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailsCell}>
              <Text style={styles.detailsLabel}>Distância:</Text>
              <Text style={styles.detailsValue}>{distanceKm} km</Text>
            </View>
            <View style={styles.detailsCell}>
              <Text style={styles.detailsLabel}>Pagamento:</Text>
              <Text style={styles.detailsValue}>{paymentMethod}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Rider details</Text>
        <View style={styles.riderCard}>
          <View style={styles.riderAvatarWrap}>
            <Image source={require('../assets/img/icon.png')} style={styles.riderLogo} resizeMode="contain" />
          </View>
          <View style={styles.riderInfo}>
            <Text style={styles.riderName}>{riderName}</Text>
            <Text style={styles.riderMeta}>{riderVehicle}</Text>
            <Text style={styles.riderMeta}>{riderPlate}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.btnPrimary} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.btnPrimaryText}>Voltar ao início</Text>
        </Pressable>
        <Pressable style={styles.btnSecondary} onPress={() => router.push('/(tabs)/activities')}>
          <Text style={styles.btnSecondaryText}>Ver detalhes</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A1D37',
  },
  header: {
    height: 56,
    backgroundColor: '#0A1D37',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 28,
  },
  body: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  successBlock: {
    alignItems: 'center',
    marginBottom: 22,
  },
  checkIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '800',
    color: '#0A1D37',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  routeCard: {
    backgroundColor: '#E3E9F2',
    borderRadius: 18,
    padding: 0,
    marginBottom: 22,
    overflow: 'hidden',
    shadowColor: '#0A1D37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  mapSection: {
    width: '100%',
    height: 197,
    position: 'relative',
    backgroundColor: '#E3E9F2',
  },
  routeMap: {
    width: '100%',
    height: 197,
  },
  mapSidePanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(10, 29, 55, 0.12)',
  },
  sideScroll: {
    height: '100%',
  },
  sideScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 10,
    minHeight: 197,
    gap: 10,
  },
  sideBlock: {
    minWidth: 0,
  },
  sideBlockGap: {
    marginTop: 0,
  },
  /** Coluna de pins: recolha no topo, entrega no fundo (flex entre eles = altura do texto). */
  sideStopsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
    minWidth: 0,
  },
  sidePinRail: {
    width: 18,
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'column',
  },
  sidePinRailFlexGap: {
    flex: 1,
    minHeight: 4,
    minWidth: 1,
  },
  sideStopsTextCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
  },
  sideStopTextBlock: {
    minWidth: 0,
  },
  sideStopTextBlockRecolha: {
    marginBottom: 10,
  },
  sideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    minWidth: 0,
  },
  sideTextCol: {
    flex: 1,
    minWidth: 0,
  },
  pinPickup: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0A1D37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDropoff: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#48CAE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinRef: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeMuted: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5A6B82',
    letterSpacing: 0.1,
  },
  routeStrong: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '800',
    color: '#0A1D37',
    lineHeight: 15,
  },
  referenceValue: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: '#2B3B53',
    lineHeight: 14,
  },
  mapPinPickup: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0A1D37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mapPinDrop: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#48CAE4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A1D37',
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 22,
    shadowColor: '#0A1D37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'stretch',
  },
  itemCol: {
    flex: 1,
    minWidth: 0,
  },
  itemDivider: {
    width: 1,
    backgroundColor: '#E4EAF2',
    marginHorizontal: 10,
  },
  itemLabel: {
    fontSize: 13,
    color: '#6B7C93',
    fontWeight: '500',
    marginBottom: 6,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0A1D37',
    lineHeight: 21,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    gap: 16,
    shadowColor: '#0A1D37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsCell: {
    flex: 1,
    minWidth: 0,
  },
  detailsLabel: {
    fontSize: 13,
    color: '#6B7C93',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A1D37',
  },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#0A1D37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  riderAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0A1D37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderLogo: {
    width: 34,
    height: 34,
  },
  riderInfo: {
    flex: 1,
    minWidth: 0,
  },
  riderName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0A1D37',
  },
  riderMeta: {
    marginTop: 4,
    fontSize: 14,
    color: '#3D4F66',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#F8F9FB',
    borderTopWidth: 1,
    borderTopColor: '#E8ECF2',
  },
  btnPrimary: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E67FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  btnSecondary: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF1F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: '#0A1D37',
    fontSize: 15,
    fontWeight: '700',
  },
});
