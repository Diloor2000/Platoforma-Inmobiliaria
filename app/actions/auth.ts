'use server';

import { createClient } from '@/lib/supabase/server';

export const createProfileOnRegister = async (
  userId: string,
  email: string,
  fullName: string,
  userType: 'cliente' | 'corredor' = 'cliente',
  phone?: string
) => {
  const supabase = await createClient();
  const isCliente = userType === 'cliente';
  const profileData: {
    id: string;
    email: string;
    full_name: string | null;
    role: 'user' | 'admin';
    status: 'approved' | 'pending_approval';
    phone?: string;
  } = {
    id: userId,
    email,
    full_name: fullName || null,
    role: isCliente ? 'user' : 'admin',
    status: isCliente ? 'approved' : 'pending_approval',
  };
  if (userType === 'corredor' && phone) {
    profileData.phone = phone;
  }
  const { error } = await supabase.from('profiles').upsert(profileData, { onConflict: 'id' });
  if (error) return { error: error.message };
  return { success: true };
};
