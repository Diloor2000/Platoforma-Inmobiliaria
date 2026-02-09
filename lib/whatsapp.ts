const ECUADOR_CODE = '593';

/**
 * Formatea un número de teléfono con código de país de Ecuador (+593) si no lo tiene.
 * Acepta números con o sin +, con espacios o guiones. Devuelve solo dígitos para wa.me (sin +).
 */
export function formatPhoneEcuador(phone: string | null | undefined): string {
  if (!phone || typeof phone !== 'string') return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.startsWith(ECUADOR_CODE)) return digits;
  if (digits.length === 9 && digits.startsWith('0')) return ECUADOR_CODE + digits.slice(1);
  if (digits.length === 9) return ECUADOR_CODE + digits;
  if (digits.length === 10 && digits.startsWith('0')) return ECUADOR_CODE + digits.slice(1);
  return digits;
}

/**
 * Genera la URL de WhatsApp (wa.me) con el mensaje prellenado.
 * @param phone Número con código país (solo dígitos, ej: 593991234567)
 * @param text Mensaje prellenado (se codifica en URL)
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const normalized = formatPhoneEcuador(phone) || phone.replace(/\D/g, '');
  if (!normalized) return '';
  const params = new URLSearchParams({ text });
  return `https://wa.me/${normalized}?${params.toString()}`;
}
