import { Alert, Linking } from 'react-native';

/**
 * Abre a app de telefone com o número indicado (motorista / entregador).
 * @param {string | undefined | null} phone
 */
export async function openPhoneDialer(phone) {
  const raw = String(phone ?? '').trim();
  const forTel = raw.replace(/[^\d+]/g, '');
  if (!forTel || forTel === '+') {
    Alert.alert('Contacto indisponível', 'Não há número de telefone para ligar.');
    return;
  }
  const url = `tel:${forTel}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Não foi possível abrir a chamada', forTel);
  }
}
