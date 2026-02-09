'use client';

import { useState } from 'react';
import { createWebAppointment } from '@/app/actions/appointments';
import { useToast } from '@/components/Toast';
import { Calendar, Clock } from 'lucide-react';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00', '19:00',
];

interface AppointmentPickerProps {
  propertyId: string;
}

export const AppointmentPicker = ({ propertyId }: AppointmentPickerProps) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      showToast('Selecciona fecha y hora', 'error');
      return;
    }
    setLoading(true);
    const result = await createWebAppointment(propertyId, date, time, notes);
    setLoading(false);
    if (result.error) {
      showToast(result.error, 'error');
      return;
    }
    showToast(`Cita solicitada con éxito. El asesor ${result.agentName} revisará tu solicitud.`, 'success');
    setDate('');
    setTime('');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <Calendar className="h-4 w-4" />
          Fecha
        </label>
        <input
          type="date"
          value={date}
          min={minDateStr}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800/50 dark:focus:border-amber-400"
        />
      </div>
      <div>
        <label className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          Hora
        </label>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800/50 dark:focus:border-amber-400"
        >
          <option value="">Selecciona hora</option>
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          Notas (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Ej. Preferencia de visita por la mañana"
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800/50 dark:placeholder:text-slate-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/25 transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-slate-900"
      >
        {loading ? 'Agendando...' : (
          <>
            <Calendar className="h-5 w-5" />
            Solicitar cita
          </>
        )}
      </button>
    </form>
  );
};
