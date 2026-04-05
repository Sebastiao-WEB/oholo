import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import KeyboardAvoidingForm from '../components/KeyboardAvoidingForm';
import ProviderImagePickerRow from '../components/ProviderImagePickerRow';
import {
  createProviderWithFirstVehicle,
  initLocalDatabase,
  setProviderDocumentPhotoUri,
  setProviderLicensePhotoUri,
  setVehiclePhotoUri as persistVehiclePhotoUri,
} from '../db';
import {
  copyProviderDocumentPhoto,
  copyProviderLicensePhoto,
  copyVehiclePhoto,
} from '../utils/providerMedia';
import { getSessionUserId } from '../utils/session';

const PROVIDER_TYPES = [
  { id: 'driver', label: 'Motorista', sub: 'Transporte de passageiros' },
  { id: 'courier', label: 'Entregador', sub: 'Delivery na cidade' },
  { id: 'both', label: 'Motorista e entregador', sub: 'Ambos os serviços' },
];

const VEHICLE_TYPES = [
  { id: 'car', label: 'Carro' },
  { id: 'motorbike', label: 'Mota' },
  { id: 'van', label: 'Carrinha' },
];

export default function ProviderRegisterScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [providerType, setProviderType] = useState('driver');
  const [documentNumber, setDocumentNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [color, setColor] = useState('');
  const [documentPhotoUri, setDocumentPhotoUri] = useState(null);
  const [licensePhotoUri, setLicensePhotoUri] = useState(null);
  const [vehiclePhotoUri, setVehiclePhotoUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadSession = useCallback(async () => {
    setLoadingSession(true);
    try {
      initLocalDatabase();
      const id = await getSessionUserId();
      setUserId(id);
      if (id == null) {
        Alert.alert('Sessão', 'Inicie sessão para registar o perfil de prestador.', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
      }
    } finally {
      setLoadingSession(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const onSubmit = async () => {
    if (userId == null) {
      return;
    }
    const doc = documentNumber.trim();
    if (!doc) {
      Alert.alert('Dados em falta', 'Indique o número do documento de identificação.');
      return;
    }
    if (!brand.trim() || !model.trim() || !plateNumber.trim() || !color.trim()) {
      Alert.alert('Veículo', 'Preencha marca, modelo, matrícula e cor do veículo.');
      return;
    }

    setSubmitting(true);
    try {
      const result = createProviderWithFirstVehicle({
        userId,
        providerType,
        documentNumber: doc,
        licenseNumber: licenseNumber.trim() || null,
        vehicleType,
        brand: brand.trim(),
        model: model.trim(),
        plateNumber: plateNumber.trim(),
        color: color.trim(),
      });

      if (!result.ok) {
        const msg =
          result.error === 'plate_taken'
            ? 'Esta matrícula já está registada. Use outra ou contacte o suporte.'
            : result.error === 'already_provider'
              ? 'Já tem perfil de prestador. Abra o painel em Trabalho.'
              : 'Não foi possível guardar. Tente novamente.';
        Alert.alert('Registo', msg);
        if (result.error === 'already_provider') {
          router.replace('/provider-hub');
        }
        return;
      }

      const { profileId, vehicleId } = result;
      try {
        if (documentPhotoUri) {
          const uri = await copyProviderDocumentPhoto(documentPhotoUri, userId);
          setProviderDocumentPhotoUri(profileId, uri);
        }
        if (licensePhotoUri) {
          const uri = await copyProviderLicensePhoto(licensePhotoUri, userId);
          setProviderLicensePhotoUri(profileId, uri);
        }
        if (vehiclePhotoUri) {
          const uri = await copyVehiclePhoto(vehiclePhotoUri, userId, vehicleId);
          persistVehiclePhotoUri(vehicleId, uri);
        }
      } catch (e) {
        console.error(e);
        Alert.alert(
          'Fotos',
          'O perfil foi criado, mas não foi possível guardar todas as imagens. Pode voltar ao painel e adicionar fotos ao adicionar outro veículo ou contactar suporte.'
        );
      }

      Alert.alert('Perfil criado', 'Pode definir a sua disponibilidade no painel de prestador.', [
        { text: 'OK', onPress: () => router.replace('/provider-hub') },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSession) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#006AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (userId == null) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Prestador Oholo</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingWrap}>
          <Text style={styles.muted}>A redirecionar…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Activar perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingForm style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lead}>
          Registe-se como motorista ou entregador na piloto Oholo (dados guardados neste dispositivo).
        </Text>

        <Text style={styles.section}>Tipo de parceria</Text>
        <View style={styles.chipCol}>
          {PROVIDER_TYPES.map((opt) => {
            const active = providerType === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setProviderType(opt.id)}
                style={[styles.typeCard, active && styles.typeCardActive]}
              >
                <Text style={[styles.typeTitle, active && styles.typeTitleActive]}>{opt.label}</Text>
                <Text style={styles.typeSub}>{opt.sub}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>Documentação</Text>
        <Text style={styles.label}>Nº documento de identificação</Text>
        <TextInput
          style={styles.input}
          value={documentNumber}
          onChangeText={setDocumentNumber}
          placeholder="Ex.: BI / passaporte"
          placeholderTextColor="#8A9AB5"
          autoCapitalize="characters"
        />
        <Text style={styles.label}>Carta de condução (opcional)</Text>
        <TextInput
          style={styles.input}
          value={licenseNumber}
          onChangeText={setLicenseNumber}
          placeholder="Se aplicável"
          placeholderTextColor="#8A9AB5"
        />

        <Text style={styles.section}>Fotos (opcional)</Text>
        <Text style={styles.photoHint}>
          As imagens ficam guardadas neste dispositivo. Pode adicionar documento, carta e veículo para validação futura.
        </Text>
        <ProviderImagePickerRow
          label="Foto do documento de identificação"
          subtitle="BI, passaporte ou equivalente"
          valueUri={documentPhotoUri}
          onChange={setDocumentPhotoUri}
          aspect={[4, 3]}
        />
        <ProviderImagePickerRow
          label="Foto da carta de condução"
          subtitle="Se for motorista ou tiver carta"
          valueUri={licensePhotoUri}
          onChange={setLicensePhotoUri}
          aspect={[4, 3]}
        />

        <Text style={styles.section}>Primeiro veículo</Text>
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.rowChips}>
          {VEHICLE_TYPES.map((opt) => {
            const active = vehicleType === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setVehicleType(opt.id)}
                style={[styles.vChip, active && styles.vChipActive]}
              >
                <Text style={[styles.vChipText, active && styles.vChipTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.label}>Marca</Text>
        <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="Toyota" placeholderTextColor="#8A9AB5" />
        <Text style={styles.label}>Modelo</Text>
        <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="Vitz" placeholderTextColor="#8A9AB5" />
        <Text style={styles.label}>Matrícula</Text>
        <TextInput
          style={styles.input}
          value={plateNumber}
          onChangeText={setPlateNumber}
          placeholder="NPL-00-000-MZ"
          placeholderTextColor="#8A9AB5"
          autoCapitalize="characters"
        />
        <Text style={styles.label}>Cor</Text>
        <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="Branco" placeholderTextColor="#8A9AB5" />

        <ProviderImagePickerRow
          label="Foto do veículo"
          subtitle="Opcional — ajuda a identificar a viatura"
          valueUri={vehiclePhotoUri}
          onChange={setVehiclePhotoUri}
          aspect={[16, 9]}
        />

        <Pressable
          style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
          onPress={() => void onSubmit()}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Criar perfil de prestador</Text>
          )}
        </Pressable>
      </KeyboardAvoidingForm>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A2547',
  },
  flex: { flex: 1, backgroundColor: '#F6F8FC' },
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
  loadingWrap: {
    flex: 1,
    backgroundColor: '#F6F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: { color: '#51627B', fontSize: 15 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 32,
  },
  lead: {
    fontSize: 14,
    color: '#51627B',
    lineHeight: 20,
    marginBottom: 18,
  },
  section: {
    fontSize: 13,
    fontWeight: '800',
    color: '#63758F',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
    marginTop: 8,
  },
  chipCol: { gap: 10, marginBottom: 8 },
  typeCard: {
    borderWidth: 2,
    borderColor: '#D4DEEA',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  typeCardActive: {
    borderColor: '#006AFF',
    backgroundColor: '#F0F6FF',
  },
  typeTitle: { fontSize: 16, fontWeight: '800', color: '#0A2547' },
  typeTitleActive: { color: '#006AFF' },
  typeSub: { marginTop: 4, fontSize: 13, color: '#51627B' },
  photoHint: {
    fontSize: 13,
    color: '#51627B',
    lineHeight: 19,
    marginBottom: 4,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#395271', marginBottom: 6, marginTop: 10 },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D5E6',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0A2547',
  },
  rowChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  vChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D4DEEA',
    backgroundColor: '#FFFFFF',
  },
  vChipActive: { borderColor: '#006AFF', backgroundColor: '#EAF4FF' },
  vChipText: { fontSize: 14, fontWeight: '700', color: '#51627B' },
  vChipTextActive: { color: '#006AFF' },
  primaryBtn: {
    marginTop: 24,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#006AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
