import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * @param {{ label: string; subtitle?: string; valueUri: string | null; onChange: (uri: string | null) => void; aspect?: [number, number] }} props
 */
export default function ProviderImagePickerRow({ label, subtitle, valueUri, onChange, aspect = [4, 3] }) {
  const pickLibrary = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Oholo', 'Precisamos de permissão para aceder à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  }, [aspect, onChange]);

  const pickCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Oholo', 'Precisamos de permissão para usar a câmara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  }, [aspect, onChange]);

  const openOptions = useCallback(() => {
    Alert.alert(label, 'Como deseja adicionar a imagem?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Galeria', onPress: () => void pickLibrary() },
      { text: 'Câmara', onPress: () => void pickCamera() },
    ]);
  }, [label, pickLibrary, pickCamera]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      <View style={styles.row}>
        <Pressable style={styles.thumbBox} onPress={openOptions}>
          {valueUri ? (
            <Image source={{ uri: valueUri }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={28} color="#8A9AB5" />
              <Text style={styles.placeholderText}>Toque para adicionar</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.actions}>
          <Pressable style={styles.miniBtn} onPress={openOptions}>
            <Ionicons name="images-outline" size={18} color="#006AFF" />
            <Text style={styles.miniBtnText}>Escolher</Text>
          </Pressable>
          {valueUri ? (
            <Pressable style={styles.miniBtnMuted} onPress={() => onChange(null)}>
              <Ionicons name="trash-outline" size={18} color="#C0392B" />
              <Text style={styles.miniBtnTextMuted}>Remover</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#395271', marginBottom: 4 },
  sub: { fontSize: 12, color: '#8A9AB5', marginBottom: 8, lineHeight: 17 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumbBox: {
    width: 120,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#C7D5E6',
    backgroundColor: '#FFFFFF',
  },
  thumb: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F4FA', padding: 8 },
  placeholderText: { marginTop: 4, fontSize: 10, fontWeight: '600', color: '#8A9AB5', textAlign: 'center' },
  actions: { flex: 1, gap: 8 },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#006AFF',
    backgroundColor: '#EAF4FF',
  },
  miniBtnText: { fontSize: 13, fontWeight: '700', color: '#006AFF' },
  miniBtnMuted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8B4B4',
    backgroundColor: '#FDEAEA',
  },
  miniBtnTextMuted: { fontSize: 13, fontWeight: '700', color: '#C0392B' },
});
