'use client';

import { useState } from 'react';
import { submitLead } from '@/app/actions/leads';
import { useToast } from '@/components/Toast';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';
import { buildWhatsAppUrl, formatPhoneEcuador } from '@/lib/whatsapp';
import { SUPER_ADMIN_PHONE } from '@/lib/constants';

interface LeadFormProps {
  propertyId: string;
  propertyTitle: string;
  agentPhone?: string | null;
}

export const LeadForm = ({ propertyId, propertyTitle, agentPhone }: LeadFormProps) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const targetPhone = (agentPhone && formatPhoneEcuador(agentPhone))
    ? formatPhoneEcuador(agentPhone)
    : SUPER_ADMIN_PHONE.replace(/\D/g, '');

  const openWhatsApp = (text: string) => {
    const url = buildWhatsAppUrl(targetPhone, text);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await submitLead(propertyId, message);
    setLoading(false);
    if (result.error) {
      showToast(result.error, 'error');
      return;
    }
    const whatsappText = `Hola, tengo una consulta sobre la propiedad "${propertyTitle}": ${message.trim()}`;
    openWhatsApp(whatsappText);
    showToast('Mensaje enviado. Se abrió WhatsApp para contactar al asesor.', 'success');
    setMessage('');
  };

  const handleWhatsAppOnly = () => {
    const text = message.trim()
      ? `Hola, tengo una consulta sobre la propiedad "${propertyTitle}": ${message.trim()}`
      : `Hola, me interesa la propiedad "${propertyTitle}". ¿Podrían darme más información?`;
    openWhatsApp(text);
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
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/25 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-slate-900"
        >
          {loading ? 'Enviando...' : 'Enviar consulta'}
        </button>
        <button
          type="button"
          onClick={handleWhatsAppOnly}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#25D366] bg-[#25D366]/10 py-2.5 text-sm font-semibold text-[#128C7E] hover:bg-[#25D366]/20 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 dark:bg-[#25D366]/20 dark:text-[#25D366]"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Contactar por WhatsApp
        </button>
      </div>
    </form>
  );
};
