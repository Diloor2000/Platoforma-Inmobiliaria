import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { PropertyCard } from '@/components/PropertyCard';
import { supabase } from '@/lib/supabase';
import { MOCK_PROPERTIES } from '@/lib/constants';
import type { Property } from '@/types';

export default async function HomePage() {
  let properties: Property[] = [...MOCK_PROPERTIES];
  let error: Error | null = null;

  try {
    const { data, error: sbError } = await supabase
      .from('properties')
      .select('*');
    if (!sbError && data && data.length > 0) {
      properties = data as Property[];
    }
  } catch (e) {
    error = e instanceof Error ? e : new Error('Error al cargar datos');
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
          Propiedades destacadas
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Resultados en base a tu mercado objetivo.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {error && (
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            No se pudieron cargar datos desde Supabase. Se muestran propiedades de ejemplo.
          </p>
        )}
      </section>
    </main>
  );
}
