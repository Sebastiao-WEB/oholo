import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RideCompletedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const pickupName = String(params.pickupName || 'Centro de Nampula, Nampula');
  const destinationName = String(params.destinationName || 'Aeroporto de Nampula (APL)');
  const estimatedPrice = String(params.estimatedPrice || '23');
  const totalTimeMin = String(params.totalTimeMin || '12');
  const distanceKm = String(params.distanceKm || '3,2');
  const paymentMethod = String(params.paymentMethod || 'M-Pesa');
  const rideType = String(params.rideType || 'Económica');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(tabs)')} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Corrida concluída</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.successWrap}>
          <View style={styles.checkIconWrap}>
            <Ionicons name="checkmark" size={48} color="#2E7BFF" />
          </View>
          <Text style={styles.successText}>A sua corrida foi concluída com sucesso</Text>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Resumo da viagem</Text>
              <View style={styles.brandRow}>
                <Image source={require('../assets/img/icon.png')} style={styles.brandIcon} />
                <Text style={styles.brandText}>Oholo</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Ionicons name="location" size={24} color="#48CAE4" />
              <View style={styles.summaryCopy}>
                <Text style={styles.summaryLabel}>Origem:</Text>
                <Text style={styles.summaryValue}>{pickupName}</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Ionicons name="flag" size={22} color="#0A2547" />
              <View style={styles.summaryCopy}>
                <Text style={styles.summaryLabel}>Destino:</Text>
                <Text style={styles.summaryValue}>{destinationName}</Text>
              </View>
            </View>

            <Text style={styles.referenceText}>Referência: Perto do Hotel Milénio</Text>
          </View>

          <Text style={styles.sectionTitle}>Detalhes da corrida</Text>
          <View style={styles.metricsGroup}>
            <View style={styles.metricsRowTop}>
              <View style={styles.metricItemTop}>
                <Ionicons name="wallet-outline" size={17} color="#0A2547" />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricLabel}>Valor final:</Text>
                  <Text style={styles.metricValue}>{estimatedPrice} MT</Text>
                </View>
              </View>
              <View style={styles.metricItemTop}>
                <Ionicons name="time-outline" size={17} color="#0A2547" />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricLabel}>Tempo total:</Text>
                  <Text style={styles.metricValue}>{totalTimeMin} min</Text>
                </View>
              </View>
              <View style={styles.metricItemTop}>
                <Ionicons name="trail-sign-outline" size={17} color="#0A2547" />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricLabel}>Distância:</Text>
                  <Text style={styles.metricValue}>{distanceKm} km</Text>
                </View>
              </View>
            </View>

            <View style={styles.metricsRowBottom}>
              <View style={styles.metricItemBottom}>
                <Ionicons name="card-outline" size={17} color="#0A2547" />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricLabel}>Pagamento:</Text>
                  <Text style={styles.metricValue}>{paymentMethod}</Text>
                </View>
              </View>
              <View style={styles.metricItemBottom}>
                <Ionicons name="car-outline" size={17} color="#0A2547" />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricLabel}>Tipo:</Text>
                  <Text style={styles.metricValue}>{rideType}</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Detalhes do motorista</Text>
          <View style={styles.driverRow}>
            <Image source={require('../assets/img/avatar.png')} style={styles.driverAvatar} />
            <View>
              <Text style={styles.driverName}>Paulo Ernesto</Text>
              <Text style={styles.driverMeta}>Toyota Vitz branco</Text>
              <Text style={styles.driverMeta}>NPL-23-458-MZ</Text>
            </View>
          </View>

          <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.primaryButtonText}>Voltar ao início</Text>
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
  successWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  checkIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    marginTop: 8,
    color: '#1E2D45',
    fontSize: 22 / 1.2,
    fontWeight: '800',
    textAlign: 'center',
    maxWidth: 260,
  },
  mainCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
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
  referenceText: {
    marginTop: 2,
    color: '#7C8DA5',
    fontSize: 13,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    color: '#0A2547',
    fontSize: 33 / 2,
    fontWeight: '800',
  },
  metricsGroup: {
    gap: 8,
  },
  metricsRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  metricsRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricItemTop: {
    flex: 1,
    minHeight: 64,
    backgroundColor: '#F8FAFD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3EAF4',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricItemBottom: {
    flex: 1,
    minHeight: 64,
    backgroundColor: '#F8FAFD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3EAF4',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 14,
    fontWeight: '800',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  driverAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#E5EAF2',
  },
  driverName: {
    color: '#1F2F47',
    fontSize: 16,
    fontWeight: '800',
  },
  driverMeta: {
    marginTop: 1,
    color: '#2B3B53',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    marginTop: 10,
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
});
