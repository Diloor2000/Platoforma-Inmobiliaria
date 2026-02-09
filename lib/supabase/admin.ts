import { createClient } from '@supabase/supabase-js';

/** Mensaje amigable cuando falta la clave (Disponibilidad: no romper la app). */
export const SUPABASE_SERVICE_ROLE_KEY_MISSING_MESSAGE =
  'No se puede subir imágenes: falta la clave de servidor (SUPABASE_SERVICE_ROLE_KEY). Añádela en .env.local. El resto de la aplicación sigue funcionando.';

/**
 * Cliente Supabase con service role.
 * SOLO importar desde Server Actions o API routes ('use server'). Nunca desde componentes cliente.
 * La variable se carga desde process.env solo en el servidor (Next.js no expone env sin NEXT_PUBLIC_).
 * Integridad: si se importa en cliente, falla antes de leer la clave.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient solo puede usarse en el servidor. No importar en componentes cliente.');
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!key || key.trim() === '') {
    throw new Error(SUPABASE_SERVICE_ROLE_KEY_MISSING_MESSAGE);
  }
  return createClient(url, key);
}

/** Devuelve true si la clave está definida (para validar sin lanzar). Solo ejecutar en servidor. */
export function hasServiceRoleKey(): boolean {
  if (typeof window !== 'undefined') return false;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return key.trim() !== '';
}
