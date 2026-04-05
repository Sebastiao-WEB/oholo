/** Formata telefone guardado como +258XXXXXXXXX para leitura humana. */
export function formatPhoneForDisplay(e164) {
  const d = String(e164 ?? '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('258')) {
    const n = d.slice(3);
    if (n.length === 9) {
      return `+258 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`;
    }
  }
  return e164 || '';
}
