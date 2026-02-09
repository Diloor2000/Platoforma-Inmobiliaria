'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProperty } from '@/app/actions/properties';
import { useToast } from '@/components/Toast';
import { ECUADOR_LOCATIONS } from '@/lib/locations';
import { Plus, X } from 'lucide-react';

export const AddPropertyModal = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('image');
    const hasImageFile = file instanceof File && file.size > 0 && file.type.startsWith('image/');
    setUploadingImage(hasImageFile);
    setLoading(true);
    const result = await createProperty(formData);
    setLoading(false);
    setUploadingImage(false);
    if (result.error) {
      showToast(result.error, 'error');
      return;
    }
    showToast('Propiedad creada correctamente', 'success');
    setOpen(false);
    form.reset();
    router.refresh();
  };

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-900';
  const labelClass = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/25 transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        <Plus className="h-4 w-4" />
        Añadir propiedad
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700/80 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95">
              <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                Nueva propiedad
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label htmlFor="title" className={labelClass}>Título</label>
                <input id="title" name="title" type="text" required className={inputClass} placeholder="Ej. Penthouse con vista al río" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className={labelClass}>Precio (USD)</label>
                  <input id="price" name="price" type="number" required min={1} className={inputClass} placeholder="250000" />
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
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="beds" className={labelClass}>Habitaciones</label>
                  <input id="beds" name="beds" type="number" required min={0} className={inputClass} placeholder="3" />
                </div>
                <div>
                  <label htmlFor="baths" className={labelClass}>Baños</label>
                  <input id="baths" name="baths" type="number" required min={0} className={inputClass} placeholder="2" />
                </div>
                <div>
                  <label htmlFor="sqft" className={labelClass}>m²</label>
                  <input id="sqft" name="sqft" type="number" required min={1} className={inputClass} placeholder="150" />
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
                <label htmlFor="agent_name_modal" className={labelClass}>Nombre asesor responsable <span className="text-red-500">*</span></label>
                <input id="agent_name_modal" name="agent_name" type="text" required className={inputClass} placeholder="Ej. María García" />
              </div>
              <div>
                <label htmlFor="agent_phone_modal" className={labelClass}>Teléfono contacto / WhatsApp (opcional)</label>
                <input id="agent_phone_modal" name="agent_phone" type="tel" className={inputClass} placeholder="099 123 4567 o +593" />
              </div>
              <div>
                <label htmlFor="image" className={labelClass}>Imagen (opcional)</label>
                <input id="image" name="image" type="file" accept="image/*" className={inputClass + ' file:mr-2 file:rounded-xl file:border-0 file:bg-amber-400/20 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-700 dark:file:bg-amber-400/10 dark:file:text-amber-300'} />
              </div>
              <div>
                <label htmlFor="description" className={labelClass}>Descripción</label>
                <textarea id="description" name="description" rows={3} required className={inputClass + ' resize-none'} placeholder="Descripción de la propiedad..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/25 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-slate-900"
                >
                  {loading ? (uploadingImage ? 'Subiendo imagen...' : 'Creando...') : 'Crear propiedad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
