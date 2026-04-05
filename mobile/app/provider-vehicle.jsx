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
import { addVehicleForUser, getProviderProfileForUser, initLocalDatabase, setVehiclePhotoUri as persistVehiclePhotoUri } from '../db';
import { copyVehiclePhoto } from '../utils/providerMedia';
import { getSessionUserId } from '../utils/session';

const VEHICLE_TYPES = [
  { id: 'car', label: 'Carro' },
  { id: 'motorbike', label: 'Mota' },
  { id: 'van', label: 'Carrinha' },
];

export default function ProviderVehicleScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [checking, setChecking] = useState(true);
  const [vehicleType, setVehicleType] = useState('car');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [color, setColor] = useState('');
  const [vehiclePhotoUri, setVehiclePhotoUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setChecking(true);
    try {
      initLocalDatabase();
      const id = await getSessionUserId();
      setUserId(id);
      if (id != null) {
        const p = getProviderProfileForUser(id);
        if (!p) {
          Alert.alert('Perfil', 'Precisa de perfil de prestador.', [
            { text: 'OK', onPress: () => router.replace('/provider-register') },
          ]);
        }
      }
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    if (userId == null) return;
    if (!brand.trim() || !model.trim() || !plateNumber.trim() || !color.trim()) {
      Alert.alert('Veículo', 'Preencha todos os campos.');
      return;
    }
    setSubmitting(true);
    try {
      const r = addVehicleForUser(userId, {
        vehicleType,
        brand: brand.trim(),
        model: model.trim(),
        plateNumber: plateNumber.trim(),
        color: color.trim(),
      });
      if (!r.ok) {
        Alert.alert(
          'Erro',
          r.error === 'plate_taken'
            ? 'Matrícula já registada.'
            : r.error === 'no_profile'
              ? 'Sem perfil de prestador.'
              : 'Não foi possível guardar.'
        );
        return;
      }
      const newVehicleId = r.vehicleId;
      if (vehiclePhotoUri && newVehicleId != null) {
        try {
          const uri = await copyVehiclePhoto(vehiclePhotoUri, userId, newVehicleId);
          persistVehiclePhotoUri(newVehicleId, uri);
        } catch (e) {
          console.error(e);
          Alert.alert(
            'Foto',
            'Veículo guardado, mas a foto não foi copiada. Pode editar mais tarde quando existir essa opção no painel.'
          );
        }
      }
      Alert.alert('Guardado', 'Veículo adicionado.', [{ text: 'OK', onPress: () => router.back() }]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Novo veículo</Text>
        <View style={styles.headerSpacer} />
      </View>

      {checking ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#006AFF" />
        </View>
      ) : (
        <KeyboardAvoidingForm style={styles.flex} contentContainerStyle={styles.content}>
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.rowChips}>
            {VEHICLE_TYPES.map((opt) => {
              const active = vehicleType === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setVehicleType(opt.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.label}>Marca</Text>
          <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholderTextColor="#8A9AB5" placeholder="Marca" />
          <Text style={styles.label}>Modelo</Text>
          <TextInput style={styles.input} value={model} onChangeText={setModel} placeholderTextColor="#8A9AB5" placeholder="Modelo" />
          <Text style={styles.label}>Matrícula</Text>
          <TextInput
            style={styles.input}
            value={plateNumber}
            onChangeText={setPlateNumber}
            placeholderTextColor="#8A9AB5"
            placeholder="Matrícula"
            autoCapitalize="characters"
          />
          <Text style={styles.label}>Cor</Text>
          <TextInput style={styles.input} value={color} onChangeText={setColor} placeholderTextColor="#8A9AB5" placeholder="Cor" />

          <ProviderImagePickerRow
            label="Foto do veículo"
            subtitle="Opcional"
            valueUri={vehiclePhotoUri}
            onChange={setVehiclePhotoUri}
            aspect={[16, 9]}
          />

          <Pressable
            style={[styles.btn, submitting && styles.btnDisabled]}
            onPress={() => void onSave()}
            disabled={submitting}
          >
            {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Guardar veículo</Text>}
          </Pressable>
        </KeyboardAvoidingForm>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A2547' },
  flex: { flex: 1, backgroundColor: '#F6F8FC' },
  header: {
    height: 56,
    backgroundColor: '#0A2547',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  headerSpacer: { width: 26 },
  loadingWrap: { flex: 1, backgroundColor: '#F6F8FC', justifyContent: 'center', alignItems: 'center' },
  content: { padding: 18, paddingBottom: 32 },
  label: { fontSize: 13, fontWeight: '600', color: '#395271', marginBottom: 6, marginTop: 12 },
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
  rowChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D4DEEA',
    backgroundColor: '#FFFFFF',
  },
  chipActive: { borderColor: '#006AFF', backgroundColor: '#EAF4FF' },
  chipText: { fontSize: 14, fontWeight: '700', color: '#51627B' },
  chipTextActive: { color: '#006AFF' },
  btn: {
    marginTop: 28,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#006AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
