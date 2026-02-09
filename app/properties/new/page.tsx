'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { createProperty } from '@/app/actions/properties';
import { useToast } from '@/components/Toast';
import { ECUADOR_LOCATIONS } from '@/lib/locations';

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-900';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400';

export default function NewPropertyPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setLoading(true);
    const result = await createProperty(formData);
    setLoading(false);
    if (result.error) {
      showToast(result.error, 'error');
      return;
    }
    showToast('Propiedad creada correctamente', 'success');
    router.push('/dashboard#inventario');
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto max-w-xl px-4 pt-24 pb-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
            Nueva propiedad
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Completa los datos para publicar en el inventario.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="title" className={labelClass}>Título</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className={inputClass}
                placeholder="Ej. Penthouse con vista al río Guayas"
              />
            </div>
            <div>
              <label htmlFor="description" className={labelClass}>Descripción</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                className={inputClass + ' resize-none'}
                placeholder="Descripción de la propiedad..."
              />
            </div>
            <div>
              <label htmlFor="price" className={labelClass}>Precio (USD)</label>
              <input
                id="price"
                name="price"
                type="number"
                required
                min={1}
                className={inputClass}
                placeholder="250000"
              />
            </div>
            <div>
              <label htmlFor="location" className={labelClass}>Ubicación (Ecuador)</label>
              <select id="location" name="location" required className={inputClass}>
                <option value="">Selecciona ciudad/zona</option>
                {ECUADOR_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="beds" className={labelClass}>Habitaciones</label>
                <input
                  id="beds"
                  name="beds"
                  type="number"
                  required
                  min={0}
                  className={inputClass}
                  placeholder="3"
                />
              </div>
              <div>
                <label htmlFor="baths" className={labelClass}>Baños</label>
                <input
                  id="baths"
                  name="baths"
                  type="number"
                  required
                  min={0}
                  className={inputClass}
                  placeholder="2"
                />
              </div>
              <div>
                <label htmlFor="sqft" className={labelClass}>Metraje (m²)</label>
                <input
                  id="sqft"
                  name="sqft"
                  type="number"
                  required
                  min={1}
                  className={inputClass}
                  placeholder="150"
                />
              </div>
            </div>
            <div>
              <label htmlFor="status" className={labelClass}>Estado</label>
              <select id="status" name="status" className={inputClass}>
                <option value="Disponible">Disponible</option>
                <option value="En venta">En venta</option>
                <option value="Reservado">Reservado</option>
              </select>
            </div>
            <div>
              <label htmlFor="image" className={labelClass}>Imagen de la propiedad (opcional)</label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className={inputClass + ' file:mr-2 file:rounded-xl file:border-0 file:bg-amber-400/20 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-700 dark:file:bg-amber-400/10 dark:file:text-amber-300'}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 shadow-xl shadow-amber-400/25 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-slate-900"
              >
                {loading ? 'Creando...' : 'Crear propiedad'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
