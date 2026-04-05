import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OPTIONS = [
  {
    key: 'driver',
    title: 'Quero ser motorista parceiro',
    subtitle: 'Transporte de passageiros com veículo próprio',
    icon: 'car-sport-outline',
    iconBg: '#EAF4FF',
    iconColor: '#006AFF',
  },
  {
    key: 'courier',
    title: 'Quero ser entregador',
    subtitle: 'Delivery de encomendas e compras na cidade',
    icon: 'bicycle-outline',
    iconBg: '#E8FAFC',
    iconColor: '#48CAE4',
  },
  {
    key: 'docs',
    title: 'Documentos e requisitos',
    subtitle: 'O que precisa para se candidatar',
    icon: 'document-text-outline',
    iconBg: '#E8EEF5',
    iconColor: '#0A2547',
  },
  {
    key: 'support',
    title: 'Falar com a equipa Oholo',
    subtitle: 'Dúvidas sobre parceria e piloto em Nampula',
    icon: 'chatbubbles-outline',
    iconBg: '#F0F4FA',
    iconColor: '#51627B',
  },
];

function showSoon() {
  Alert.alert(
    'Oholo',
    'Esta opção estará disponível em breve. Na fase piloto em Nampula, a equipa Oholo pode orientar o seu registo presencial ou por canais oficiais.'
  );
}

export default function WorkTabScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/(tabs)')} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Trabalho</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenSubtitle}>
          Junte-se como motorista ou entregador e ganhe com a mobilidade na sua cidade.
        </Text>

        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="rocket-outline" size={18} color="#006AFF" />
            <Text style={styles.heroBadgeText}>Piloto em Nampula</Text>
          </View>
          <Text style={styles.heroTitle}>Parceria flexível</Text>
          <Text style={styles.heroBody}>
            Defina a sua disponibilidade, receba pedidos na app e acompanhe ganhos com transparência.
          </Text>
          <View style={styles.heroList}>
            <View style={styles.heroRow}>
              <Ionicons name="checkmark-circle" size={20} color="#1B7A4C" />
              <Text style={styles.heroRowText}>Pagamentos e suporte locais</Text>
            </View>
            <View style={styles.heroRow}>
              <Ionicons name="checkmark-circle" size={20} color="#1B7A4C" />
              <Text style={styles.heroRowText}>Formação inicial à plataforma</Text>
            </View>
            <View style={styles.heroRow}>
              <Ionicons name="checkmark-circle" size={20} color="#1B7A4C" />
              <Text style={styles.heroRowText}>Crescimento com delivery e bilhetes</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Como participar</Text>

        <View style={styles.list}>
          {OPTIONS.map((item) => (
            <Pressable
              key={item.key}
              style={styles.optionCard}
              onPress={showSoon}
            >
              <View style={[styles.optionIconWrap, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={24} color={item.iconColor} />
              </View>
              <View style={styles.optionBody}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B8C4D6" />
            </Pressable>
          ))}
        </View>

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#0A2547" />
          <Text style={styles.infoText}>
            O processo completo de candidatura digital será activado nas próximas versões da app.
          </Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={showSoon}>
          <Text style={styles.primaryButtonText}>Quero candidatar-me</Text>
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
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
  },
  screenSubtitle: {
    fontSize: 15,
    color: '#6C7B90',
    lineHeight: 22,
    marginBottom: 16,
  },
  heroCard: {
    borderRadius: 20,
    backgroundColor: '#0A2547',
    padding: 16,
    shadowColor: '#00000033',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A2547',
  },
  heroTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroBody: {
    marginTop: 8,
    fontSize: 15,
    color: '#C8D6E8',
    lineHeight: 22,
  },
  heroList: {
    marginTop: 14,
    gap: 10,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroRowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionLabel: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#63758F',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  list: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E8F2',
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  optionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBody: {
    flex: 1,
    minWidth: 0,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A2547',
  },
  optionSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#51627B',
    lineHeight: 18,
  },
  infoBanner: {
    marginTop: 18,
    borderWidth: 2,
    borderColor: '#2B63B8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: '#0A2547',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 16,
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
