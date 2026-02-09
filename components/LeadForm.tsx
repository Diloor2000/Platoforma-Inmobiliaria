'use client';

import { useState } from 'react';
import { submitLead } from '@/app/actions/leads';
import { useToast } from '@/components/Toast';

interface LeadFormProps {
  propertyId: string;
}

export const LeadForm = ({ propertyId }: LeadFormProps) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await submitLead(propertyId, message);
    setLoading(false);
    if (result.error) {
      showToast(result.error, 'error');
      return;
    }
    showToast('Mensaje enviado correctamente. Un asesor te contactará pronto.', 'success');
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label
          htmlFor="lead-message"
          className="text-xs font-medium text-slate-600 dark:text-slate-400"
        >
          Tu mensaje
        </label>
        <textarea
          id="lead-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          required
          disabled={loading}
          className="mt-1 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/50 dark:focus:border-amber-400"
          placeholder="Estoy interesado en esta propiedad..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/25 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-slate-900"
      >
        {loading ? 'Enviando...' : 'Enviar consulta'}
      </button>
    </form>
  );
};
