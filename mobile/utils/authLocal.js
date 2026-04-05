import * as Crypto from 'expo-crypto';

const MZ_PHONE_RE = /^(82|83|84|85|86|87)\d{7}$/;

/** Nome: letras (incl. acentos comuns), espaços, hífen e apóstrofo entre palavras — sem dígitos nem símbolos. */
const NAME_RE = /^[a-zA-ZÀ-ÖØ-öø-ÿ]+(?:[\s'-][a-zA-ZÀ-ÖØ-öø-ÿ]+)*$/;

const PASSWORD_MIN = 6;

/**
 * Extrai os 9 dígitos nacionais (sem +258).
 * Aceita "840000000", "+258 84 000 0000", "258840000000", etc.
 */
export function normalizeMozPhoneDigits(input) {
  const d = String(input ?? '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('258')) {
    return d.slice(3);
  }
  if (d.length === 9) {
    return d;
  }
  return null;
}

export function isValidMozPhone9(national9) {
  return typeof national9 === 'string' && MZ_PHONE_RE.test(national9);
}

export function phoneToStoredE164(national9) {
  return `+258${national9}`;
}

export function validateFullName(name) {
  const t = String(name ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  if (t.length < 2 || t.length > 150) {
    return false;
  }
  return NAME_RE.test(t);
}

export function validatePasswordLength(password) {
  return String(password ?? '').length >= PASSWORD_MIN;
}

export async function hashPasswordForStorage(plain) {
  const hex = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, String(plain));
  return `sha256:${hex}`;
}

export async function passwordMatchesStored(plain, stored) {
  const h = await hashPasswordForStorage(plain);
  return h === stored;
}
