'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateProperty } from '@/app/actions/properties';
import { useToast } from '@/components/Toast';
import type { Property } from '@/types';

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-900';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400';

export function EditPropertyForm({ property }: { property: Property }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(property.title);
  const [price, setPrice] = useState(String(property.price));
  const [description, setDescription] = useState(property.description);
  const [agentPhone, setAgentPhone] = useState(property.agent_phone ?? '');
  const [agentName, setAgentName] = useState(property.agent_name ?? '');
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) {
      showToast('El nombre del asesor responsable es obligatorio', 'error');
      return;
    }
    setLoading(true);
    const result = await updateProperty(property.id, {
      title,
      price: Number(price),
      description,
      agent_phone: agentPhone.trim() || null,
      agent_name: agentName.trim(),
    });
    setLoading(false);
    if (result.error) {
      showToast(result.error, 'error');
      return;
    }
    showToast('Propiedad actualizada correctamente', 'success');
    router.push(`/properties/${property.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="title" className={labelClass}>Título</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
          placeholder="Ej. Penthouse con vista al río Guayas"
        />
      </div>
      <div>
        <label htmlFor="price" className={labelClass}>Precio (USD)</label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min={1}
          className={inputClass}
          placeholder="250000"
        />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>Descripción</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
          className={inputClass + ' resize-none'}
          placeholder="Descripción de la propiedad..."
        />
      </div>
      <div>
        <label htmlFor="agent_name" className={labelClass}>Nombre del asesor responsable <span className="text-red-500">*</span></label>
        <input
          id="agent_name"
          type="text"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          required
          className={inputClass}
          placeholder="Ej. María García"
        />
      </div>
      <div>
        <label htmlFor="agent_phone" className={labelClass}>Teléfono de contacto / WhatsApp</label>
        <input
          id="agent_phone"
          type="tel"
          value={agentPhone}
          onChange={(e) => setAgentPhone(e.target.value)}
          className={inputClass}
          placeholder="099 123 4567 o +593 99 123 4567"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Link
          href={`/properties/${property.id}`}
          className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-2xl bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 shadow-xl shadow-amber-400/25 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-slate-900"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}
