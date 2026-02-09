'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProperty } from '@/app/actions/properties';
import { useToast } from '@/components/Toast';
import { Trash2, Loader2 } from 'lucide-react';

interface DeletePropertyButtonProps {
  propertyId: string;
  propertyTitle?: string;
}

export function DeletePropertyButton({ propertyId, propertyTitle }: DeletePropertyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteProperty(propertyId);
    setLoading(false);
    setConfirming(false);
    if (result.error) {
      showToast(result.error, 'error');
      return;
    }
    showToast('Propiedad eliminada correctamente', 'success');
    router.refresh();
  };

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 dark:bg-red-500 dark:hover:bg-red-600"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
      title={propertyTitle ? `Eliminar "${propertyTitle}"` : 'Eliminar propiedad'}
    >
      <Trash2 className="h-3 w-3" />
      Eliminar
    </button>
  );
}
