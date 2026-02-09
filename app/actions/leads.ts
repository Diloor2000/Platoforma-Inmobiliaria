'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export const submitLead = async (propertyId: string, message: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Debes iniciar sesión para enviar una consulta.' };
  }
  if (!message.trim()) {
    return { error: 'Escribe un mensaje.' };
  }
  const { error } = await supabase.from('leads').insert({
    user_id: user.id,
    property_id: propertyId,
    message: message.trim(),
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath('/dashboard');
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
};
