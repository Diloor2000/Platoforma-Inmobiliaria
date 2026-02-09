import Link from 'next/link';
import { PropertyImage } from '@/components/PropertyImage';
import { Navbar } from '@/components/Navbar';
import { LeadForm } from '@/components/LeadForm';
import { AppointmentPicker } from '@/components/AppointmentPicker';
import { createClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase';
import { SUPER_ADMIN_EMAIL } from '@/lib/constants';
import type { Property } from '@/types';

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

const GALLERY_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
];

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [property, supabaseAuth] = await Promise.all([
    getProperty(id),
    createClient(),
  ]);
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  const agentPhone = property?.agent_phone ?? null;

  if (!property) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
            Propiedad no encontrada
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Comprueba el enlace o vuelve al listado.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-2xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg hover:bg-amber-500"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  const galleryImages = [property.image, ...GALLERY_PLACEHOLDERS].slice(0, 4);
  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(p);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            <Link href="/" className="hover:text-amber-500 dark:hover:text-amber-400">
              Inicio
            </Link>
            <span className="mx-1">/</span>
            <span>Detalle</span>
          </span>
          {(user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || property.agent_id === user?.id) && (
            <Link
              href={`/properties/${property.id}/edit`}
              className="rounded-xl bg-amber-400/20 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/20"
            >
              Editar propiedad
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-4">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
              {property.title}
            </h1>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {formatPrice(property.price)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{property.location}</p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {galleryImages.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800"
                >
                  <PropertyImage
                    src={src}
                    alt={`Galería ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {property.description}
            </p>
            <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span>{property.beds} hab.</span>
              <span>{property.baths} baños</span>
              <span>{property.sqft} m²</span>
            </div>
          </div>

          <div className="w-full shrink-0 space-y-6 lg:w-96">
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-2xl shadow-slate-300/20 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 dark:shadow-slate-950/50 sm:p-6">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Solicitar cita de visita
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Elige fecha y hora para una visita con el asesor.
              </p>
              <AppointmentPicker propertyId={property.id} />
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-2xl shadow-slate-300/20 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 dark:shadow-slate-950/50 sm:p-6">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Contactar con el asesor
              </h2>
              {user ? (
                <>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Envía tu consulta y la guardaremos como lead.
                  </p>
                  <LeadForm
                    propertyId={property.id}
                    propertyTitle={property.title}
                    agentPhone={agentPhone}
                  />
                </>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Inicia sesión para enviar un mensaje de interés.
                  </p>
                  <Link
                    href={`/login?redirectTo=${encodeURIComponent(`/properties/${property.id}`)}`}
                    className="inline-block w-full rounded-2xl bg-amber-400 py-2.5 text-center text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/25 hover:bg-amber-500"
                  >
                    Iniciar sesión para enviar consulta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
