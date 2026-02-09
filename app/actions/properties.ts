'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const price = Number(formData.get('price'));
  const location = (formData.get('location') as string)?.trim();
  const beds = Number(formData.get('beds'));
  const baths = Number(formData.get('baths'));
  const sqft = Number(formData.get('sqft'));
  const status =
    (formData.get('status') as string)?.trim() || 'Disponible';
  const imageFile = formData.get('image') as File | null;

  let imageUrl = DEFAULT_IMAGE;

  if (imageFile && imageFile.size > 0 && imageFile.type.startsWith('image/')) {
    const admin = createAdminClient();
    const ext = imageFile.name.split('.').pop() || 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) return { error: 'Error al subir la imagen: ' + uploadError.message };

    const {
      data: { publicUrl },
    } = admin.storage.from(BUCKET).getPublicUrl(path);
    imageUrl = publicUrl;
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
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/');
  return { success: true };
}
