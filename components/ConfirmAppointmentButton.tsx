'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmAppointment } from '@/app/actions/appointments';
import { useToast } from '@/components/Toast';
import { Check, Loader2 } from 'lucide-react';

export function ConfirmAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleConfirm = async () => {
    setLoading(true);
    const result = await confirmAppointment(appointmentId);
    setLoading(false);
    if (result.error) {
      showToast(result.error, 'error');
      return;
    }
    showToast('Cita confirmada', 'success');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleConfirm}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-xl bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-400/30 disabled:opacity-60 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/20"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
      Confirmar
    </button>
  );
}
