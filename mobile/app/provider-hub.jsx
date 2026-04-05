import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getProviderProfileForUser,
  initLocalDatabase,
  listVehiclesForUser,
  setProviderAvailabilityByUserId,
  setVehicleStatusForUser,
} from '../db';
import { getSessionUserId } from '../utils/session';

const AVAIL = [
  { id: 'available', label: 'Disponível', icon: 'radio-button-on', color: '#1B7A4C' },
  { id: 'busy', label: 'Ocupado', icon: 'time-outline', color: '#C27C1A' },
  { id: 'offline', label: 'Offline', icon: 'moon-outline', color: '#63758F' },
];

function typeLabel(t) {
  if (t === 'courier') return 'Entregador';
  if (t === 'both') return 'Motorista e entregador';
  return 'Motorista';
}

function vehicleTypeLabel(t) {
  if (t === 'motorbike') return 'Mota';
  if (t === 'van') return 'Carrinha';
  return 'Carro';
}

function vehicleStatusLabel(status) {
  const s = String(status || 'active');
  if (s === 'maintenance') return 'Desactivada (avaria / manutenção)';
  if (s === 'inactive') return 'Inactiva';
  return 'Activa';
}

function vehicleStatusTone(status) {
  const s = String(status || 'active');
  if (s === 'maintenance') return '#C27C1A';
  if (s === 'inactive') return '#8A9AB5';
  return '#1B7A4C';
}

export default function ProviderHubScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      initLocalDatabase();
      const id = await getSessionUserId();
      setUserId(id);
      if (id == null) {
        setProfile(null);
        setVehicles([]);
        router.replace('/login');
        return;
      }
      const p = getProviderProfileForUser(id);
      setProfile(p || null);
      setVehicles(p ? listVehiclesForUser(id) : []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  const onAvailability = (status) => {
    if (userId == null || !profile) return;
    const ok = setProviderAvailabilityByUserId(userId, status);
    if (ok) {
      void reload();
    } else {
      Alert.alert('Oholo', 'Não foi possível actualizar a disponibilidade.');
    }
  };

  const onVehicleMaintenance = (vehicleId, plate) => {
    if (userId == null) return;
    Alert.alert(
      'Desactivar viatura',
      `Marcar ${plate} como indisponível por avaria ou manutenção? Pode reactivá-la quando estiver pronta.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            const ok = setVehicleStatusForUser(userId, vehicleId, 'maintenance');
            if (ok) void reload();
            else Alert.alert('Oholo', 'Não foi possível actualizar o estado da viatura.');
          },
        },
      ]
    );
  };

  const onVehicleReactivate = (vehicleId) => {
    if (userId == null) return;
    const ok = setVehicleStatusForUser(userId, vehicleId, 'active');
    if (ok) void reload();
    else Alert.alert('Oholo', 'Não foi possível reactivar a viatura.');
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Painel prestador</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#006AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Painel prestador</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Sem perfil de prestador</Text>
          <Text style={styles.emptyText}>Crie o perfil no separador Trabalho.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.replace('/provider-register')}>
            <Text style={styles.primaryBtnText}>Activar perfil</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const current = String(profile.availability_status || 'offline');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Painel prestador</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.greeting}>Olá, {String(profile.user_name || '').split(/\s+/)[0] || 'parceiro'}</Text>
          <Text style={styles.role}>{typeLabel(String(profile.provider_type))}</Text>
          <Text style={styles.hint}>A sua disponibilidade afecta se aparece em pedidos de corrida e delivery (demo local).</Text>
        </View>

        <Text style={styles.section}>Disponibilidade</Text>
        <View style={styles.availRow}>
          {AVAIL.map((a) => {
            const active = current === a.id;
            return (
              <Pressable
                key={a.id}
                onPress={() => onAvailability(a.id)}
                style={[styles.availBtn, active && { borderColor: a.color, backgroundColor: `${a.color}18` }]}
              >
                <Ionicons name={a.icon} size={22} color={active ? a.color : '#8A9AB5'} />
                <Text style={[styles.availLabel, active && { color: a.color, fontWeight: '800' }]}>{a.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {(profile.document_photo_uri || profile.license_photo_uri) ? (
          <>
            <Text style={styles.section}>Fotos do perfil</Text>
            <View style={styles.docRow}>
              {profile.document_photo_uri ? (
                <View style={styles.docThumbWrap}>
                  <Text style={styles.docThumbLabel}>Documento</Text>
                  <Image source={{ uri: String(profile.document_photo_uri) }} style={styles.docThumb} resizeMode="cover" />
                </View>
              ) : null}
              {profile.license_photo_uri ? (
                <View style={styles.docThumbWrap}>
                  <Text style={styles.docThumbLabel}>Carta</Text>
                  <Image source={{ uri: String(profile.license_photo_uri) }} style={styles.docThumb} resizeMode="cover" />
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Veículos</Text>
          <Pressable onPress={() => router.push('/provider-vehicle')} hitSlop={8}>
            <Text style={styles.link}>+ Adicionar</Text>
          </Pressable>
        </View>

        {vehicles.length === 0 ? (
          <Text style={styles.muted}>Sem veículos registados.</Text>
        ) : (
          <View style={styles.vList}>
            {vehicles.map((v) => {
              const st = String(v.status || 'active');
              const photo = v.photo_uri ? String(v.photo_uri) : '';
              return (
                <View key={v.id} style={styles.vCard}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.vPhoto} resizeMode="cover" />
                  ) : (
                    <View style={styles.vIcon}>
                      <Ionicons name="car-outline" size={22} color="#006AFF" />
                    </View>
                  )}
                  <View style={styles.vBody}>
                    <Text style={styles.vTitle}>
                      {vehicleTypeLabel(String(v.vehicle_type))} · {String(v.brand)} {String(v.model)}
                    </Text>
                    <Text style={styles.vMeta}>{String(v.plate_number)} · {String(v.color)}</Text>
                    <Text style={[styles.vStatus, { color: vehicleStatusTone(st) }]}>{vehicleStatusLabel(st)}</Text>
                    {st === 'active' ? (
                      <Pressable
                        style={styles.vActionMuted}
                        onPress={() => onVehicleMaintenance(Number(v.id), String(v.plate_number))}
                      >
                        <Ionicons name="construct-outline" size={16} color="#C27C1A" />
                        <Text style={styles.vActionMutedText}>Desactivar por avaria</Text>
                      </Pressable>
                    ) : null}
                    {st === 'maintenance' || st === 'inactive' ? (
                      <Pressable style={styles.vActionOk} onPress={() => onVehicleReactivate(Number(v.id))}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#1B7A4C" />
                        <Text style={styles.vActionOkText}>Reactivar viatura</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={20} color="#0A2547" />
          <Text style={styles.noteText}>
            Em produção, pedidos e ganhos aparecerão aqui. Por agora os dados são só no dispositivo (SQLite).
          </Text>
        </View>
      </ScrollView>
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
  headerTitle: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  headerSpacer: { width: 26 },
  body: { flex: 1, backgroundColor: '#F6F8FC' },
  content: { padding: 18, paddingBottom: 32 },
  loadingWrap: { flex: 1, backgroundColor: '#F6F8FC', justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { flex: 1, backgroundColor: '#F6F8FC', padding: 24, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0A2547', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#51627B', textAlign: 'center', marginBottom: 20 },
  hero: {
    backgroundColor: '#0A2547',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  greeting: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  role: { marginTop: 6, fontSize: 15, fontWeight: '600', color: '#48CAE4' },
  hint: { marginTop: 10, fontSize: 13, color: '#C8D6E8', lineHeight: 18 },
  section: {
    fontSize: 13,
    fontWeight: '800',
    color: '#63758F',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  link: { fontSize: 15, fontWeight: '700', color: '#006AFF' },
  availRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  availBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4DEEA',
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  availLabel: { fontSize: 12, fontWeight: '600', color: '#51627B' },
  docRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  docThumbWrap: { width: 100 },
  docThumbLabel: { fontSize: 11, fontWeight: '700', color: '#63758F', marginBottom: 6 },
  docThumb: { width: 100, height: 72, borderRadius: 10, backgroundColor: '#E0E8F2' },
  vList: { gap: 10 },
  vCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E8F2',
    gap: 12,
  },
  vPhoto: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E0E8F2',
  },
  vIcon: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vBody: { flex: 1, minWidth: 0 },
  vTitle: { fontSize: 15, fontWeight: '800', color: '#0A2547' },
  vMeta: { marginTop: 4, fontSize: 13, color: '#51627B' },
  vStatus: { marginTop: 4, fontSize: 12, fontWeight: '600' },
  vActionMuted: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFF5E6',
    borderWidth: 1,
    borderColor: '#F0D9B5',
  },
  vActionMutedText: { fontSize: 13, fontWeight: '700', color: '#C27C1A' },
  vActionOk: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#E8F5EC',
    borderWidth: 1,
    borderColor: '#B8D9C4',
  },
  vActionOkText: { fontSize: 13, fontWeight: '700', color: '#1B7A4C' },
  muted: { fontSize: 14, color: '#8A9AB5', marginBottom: 12 },
  note: {
    marginTop: 22,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2B63B8',
    backgroundColor: '#FFFFFF',
  },
  noteText: { flex: 1, fontSize: 13, color: '#0A2547', lineHeight: 19 },
  primaryBtn: {
    backgroundColor: '#006AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
