'use server';

import { createClient } from '@/lib/supabase/server';

export const createProfileOnRegister = async (
  userId: string,
  email: string,
  fullName: string
) => {
  const supabase = await createClient();
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email,
      full_name: fullName || null,
      role: 'admin',
      status: 'pending_approval',
    },
    { onConflict: 'id' }
  );
  if (error) return { error: error.message };
  return { success: true };
};
