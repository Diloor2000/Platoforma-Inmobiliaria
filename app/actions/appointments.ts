'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export const createAppointment = async (
  propertyId: string,
  appointmentDate: string,
  appointmentTime: string,
  notes?: string
) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Inicia sesión para solicitar una cita' };
  const { error } = await supabase.from('appointments').insert({
    property_id: propertyId,
    user_id: user.id,
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    notes: notes?.trim() || null,
  });
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
};
