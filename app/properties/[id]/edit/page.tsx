import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase';
import { SUPER_ADMIN_EMAIL } from '@/lib/constants';
import type { Property } from '@/types';
import { EditPropertyForm } from './EditPropertyForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProperty(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as Property;
}

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;
  const [property, supabaseAuth] = await Promise.all([
    getProperty(id),
    createClient(),
  ]);
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!property) redirect('/dashboard');
  if (!user) redirect(`/login?redirectTo=${encodeURIComponent(`/properties/${id}/edit`)}`);

  const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isAgent = property.agent_id === user.id;
  if (!isSuperAdmin && !isAgent) redirect(`/properties/${id}`);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto max-w-xl px-4 pt-24 pb-12 sm:px-6">
        <div className="mb-6 text-xs text-slate-500 dark:text-slate-400">
          <Link href={`/properties/${id}`} className="hover:text-amber-500 dark:hover:text-amber-400">
            ← Volver a la propiedad
          </Link>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
            Editar propiedad
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Modifica título, precio, descripción y teléfono de contacto.
          </p>
          <EditPropertyForm property={property} />
        </div>
      </section>
    </main>
  );
}
