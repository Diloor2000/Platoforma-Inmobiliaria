'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Citas web: sin WhatsApp. La información se guarda directamente en la tabla appointments de Supabase.
 * Estado inicial: 'pending' (pendiente). El asesor confirma desde el Dashboard.
 */
export const createWebAppointment = async (
  propertyId: string,
  appointmentDate: string,
  appointmentTime: string,
  notes?: string
) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Inicia sesión para solicitar una cita' };

  const { data: property } = await supabase
    .from('properties')
    .select('id, title, agent_name')
    .eq('id', propertyId)
    .single();

  const agentName = (property as { agent_name?: string | null } | null)?.agent_name?.trim() || null;

  const { error } = await supabase.from('appointments').insert({
    property_id: propertyId,
    user_id: user.id,
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    notes: notes?.trim() || null,
    agent_name: agentName,
    status: 'pending', // pendiente; el asesor confirma desde el Dashboard
  });

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath(`/properties/${propertyId}`);
  return { success: true, agentName: agentName || 'el asesor' };
}

export const confirmAppointment = async (appointmentId: string) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appointmentId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
}
