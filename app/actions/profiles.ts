'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export const approveProfile = async (profileId: string) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = me?.role === 'admin' || user.email?.toLowerCase() === 'diegoloor124@gmail.com';
  if (!isAdmin) return { error: 'Solo administradores pueden aprobar perfiles' };
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
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = me?.role === 'admin' || user.email?.toLowerCase() === 'diegoloor124@gmail.com';
  if (!isAdmin) return { error: 'Solo administradores pueden rechazar perfiles' };
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'rejected' })
    .eq('id', profileId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
};
