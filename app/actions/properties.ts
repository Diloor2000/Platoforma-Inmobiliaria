'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient, hasServiceRoleKey, SUPABASE_SERVICE_ROLE_KEY_MISSING_MESSAGE } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { SUPER_ADMIN_EMAIL } from '@/lib/constants';

const BUCKET = 'property-images';
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80';

/** Solo admin con status approved (o super admin) puede subir archivos y crear propiedades. */
async function canUploadFiles(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { allowed: false as const, error: 'Debes iniciar sesión' };

  if (user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())
    return { allowed: true as const };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  const isAdminApproved =
    profile?.role === 'admin' && profile?.status === 'approved';
  if (!isAdminApproved)
    return {
      allowed: false as const,
      error:
        'Solo usuarios con rol administrador y cuenta aprobada pueden subir imágenes.',
    };
  return { allowed: true as const };
}

export const createProperty = async (formData: FormData) => {
  const supabase = await createClient();
  const auth = await canUploadFiles(supabase);
  if (!auth.allowed) return { error: auth.error };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Debes iniciar sesión' };

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const price = Number(formData.get('price'));
  const location = (formData.get('location') as string)?.trim();
  const beds = Number(formData.get('beds'));
  const baths = Number(formData.get('baths'));
  const sqft = Number(formData.get('sqft'));
  const status =
    (formData.get('status') as string)?.trim() || 'Disponible';
  const agentPhone = (formData.get('agent_phone') as string)?.trim() || null;
  const agentName = (formData.get('agent_name') as string)?.trim() || null;
  const imageFile = formData.get('image') as File | null;

  let imageUrl = DEFAULT_IMAGE;

  if (imageFile && imageFile.size > 0 && imageFile.type.startsWith('image/')) {
    if (!hasServiceRoleKey()) {
      return { error: SUPABASE_SERVICE_ROLE_KEY_MISSING_MESSAGE };
    }
    try {
      const admin = createAdminClient();
      const ext = imageFile.name.split('.').pop() || 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      let uploadError = (await admin.storage.from(BUCKET).upload(path, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      })).error;

      if (uploadError) {
        const msg = uploadError.message?.toLowerCase() ?? '';
        const bucketMissing = msg.includes('bucket') && (msg.includes('not found') || msg.includes('does not exist'));
        if (bucketMissing) {
          const { error: createErr } = await admin.storage.createBucket(BUCKET, { public: true });
          if (createErr) {
            return {
              error: `El bucket "${BUCKET}" no existe en Supabase. Créalo en Storage (público) desde el panel de Supabase o contacta al administrador.`,
            };
          }
          uploadError = (await admin.storage.from(BUCKET).upload(path, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          })).error;
        }
        if (uploadError) return { error: 'Error al subir la imagen: ' + uploadError.message };
      }

      const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);
      imageUrl = publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : SUPABASE_SERVICE_ROLE_KEY_MISSING_MESSAGE;
      return { error: message };
    }
  }

  const { error } = await supabase.from('properties').insert({
    title,
    price,
    location,
    beds,
    baths,
    sqft,
    image: imageUrl,
    status,
    description,
    agent_id: user.id,
    agent_phone: agentPhone || null,
    agent_name: agentName || null,
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/');
  return { success: true };
}

/** Solo Super Admin o el corredor que subió la propiedad (agent_id) pueden editar */
async function canEditProperty(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyAgentId: string | null | undefined
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false as const, error: 'Debes iniciar sesión' };
  if (user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())
    return { allowed: true as const };
  if (propertyAgentId && propertyAgentId === user.id) return { allowed: true as const };
  return { allowed: false as const, error: 'No tienes permiso para editar esta propiedad' };
}

export const updateProperty = async (
  propertyId: string,
  data: { title: string; price: number; description: string; agent_phone: string | null; agent_name: string }
) => {
  const supabase = await createClient();
  const { data: property } = await supabase
    .from('properties')
    .select('agent_id')
    .eq('id', propertyId)
    .single();
  const auth = await canEditProperty(supabase, (property as { agent_id?: string } | null)?.agent_id);
  if (!auth.allowed) return { error: auth.error };

  const agentName = data.agent_name?.trim();
  if (!agentName) return { error: 'El nombre del asesor responsable es obligatorio' };

  const { error } = await supabase
    .from('properties')
    .update({
      title: data.title.trim(),
      price: Number(data.price),
      description: data.description.trim(),
      agent_phone: data.agent_phone?.trim() || null,
      agent_name: agentName,
    })
    .eq('id', propertyId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/');
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath(`/properties/${propertyId}/edit`);
  return { success: true };
}

/** Solo Super Admin o el dueño (agent_id) pueden eliminar. RLS en Supabase debe permitir DELETE solo para agent_id o Super Admin. */
export const deleteProperty = async (propertyId: string) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Debes iniciar sesión' };

  const { data: property } = await supabase
    .from('properties')
    .select('agent_id')
    .eq('id', propertyId)
    .single();

  const agentId = (property as { agent_id?: string } | null)?.agent_id;
  const isOwner = agentId && agentId === user.id;
  const isSuperAdminUser = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  if (!isSuperAdminUser && !isOwner)
    return { error: 'Solo el dueño de la propiedad o el Super Admin pueden eliminarla' };

  const { error } = await supabase.from('properties').delete().eq('id', propertyId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/');
  return { success: true };
}
