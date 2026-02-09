import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase con service role. Solo usar en el servidor (Server Actions, API routes).
 * Nunca exponer SUPABASE_SERVICE_ROLE_KEY en el cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY no está definida');
  return createClient(url, key);
}
