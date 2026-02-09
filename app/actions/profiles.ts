'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SUPER_ADMIN_EMAIL } from '@/lib/constants';

export const approveProfile = async (profileId: string) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };
  const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  if (!isSuperAdmin) return { error: 'Solo el Super Admin puede aprobar perfiles' };
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'approved' })
    .eq('id', profileId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
};

export const rejectProfile = async (profileId: string) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };
  const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  if (!isSuperAdmin) return { error: 'Solo el Super Admin puede rechazar perfiles' };
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'rejected' })
    .eq('id', profileId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
};
