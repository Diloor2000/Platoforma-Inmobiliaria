'use client';

import { useState } from 'react';
import { approveProfile, rejectProfile } from '@/app/actions/profiles';
import { useToast } from '@/components/Toast';
import type { Profile } from '@/types';
import { Check, X, Loader2 } from 'lucide-react';

interface ProfileRowProps {
  profile: Profile & { id: string; email?: string; full_name?: string; role: string; status: string; phone?: string };
  /** Solo el Super Admin (diegoloor124@gmail.com) puede ver y usar Aprobar/Rechazar/Revocar */
  canManageAsesores?: boolean;
  /** Si false, no se muestran las celdas Rol ni Estado (para que asesores no auditen a otros). */
  showSensitiveColumns?: boolean;
  /** Rol a mostrar: "Super Admin" | "Asesor" | "Cliente" (jerarquía: solo diegoloor124 = Super Admin). */
  displayRole?: 'Super Admin' | 'Asesor' | 'Cliente';
}

export const ProfileRow = ({ profile, canManageAsesores = false, showSensitiveColumns = true, displayRole = 'Cliente' }: ProfileRowProps) => {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const { showToast } = useToast();

  const handleApprove = async () => {
    setLoading('approve');
    const result = await approveProfile(profile.id);
    setLoading(null);
    if (result.error) {
      showToast(result.error, 'error');
      return;
    }
    showToast('Usuario aprobado correctamente', 'success');
  };

  const handleReject = async () => {
    setLoading('reject');
    const result = await rejectProfile(profile.id);
    setLoading(null);
    if (result.error) {
      showToast(result.error, 'error');
      return;
    }
    showToast('Solicitud rechazada', 'info');
  };

  const isPending = profile.status === 'pending' || profile.status === 'pending_approval';
  const isRejected = profile.status === 'rejected';
  const isApproved = profile.status === 'approved';
  const isCorredor = profile.role === 'admin';

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800">
      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
        {profile.full_name ?? profile.email ?? profile.id}
      </td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
        {profile.email ?? '—'}
      </td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
        {profile.phone ?? '—'}
      </td>
      {showSensitiveColumns && (
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              profile.status === 'approved'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                : profile.status === 'rejected'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
            }`}
          >
            {profile.status === 'approved' ? 'Aprobado' : profile.status === 'rejected' ? 'Rechazado' : 'Pendiente de aprobación'}
          </span>
        </td>
      )}
      {showSensitiveColumns && (
        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
          {displayRole}
        </td>
      )}
      <td className="px-4 py-3">
        {isCorredor && canManageAsesores && (
          <div className="flex items-center gap-2">
            {!isApproved && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={!!loading}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                {loading === 'approve' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Aprobar
              </button>
            )}
            {!isRejected && (
              <button
                type="button"
                onClick={handleReject}
                disabled={!!loading}
                className="inline-flex items-center gap-1 rounded-xl border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                {loading === 'reject' ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                {isApproved ? 'Revocar' : 'Rechazar'}
              </button>
            )}
            {isRejected && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={!!loading}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                {loading === 'approve' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Aprobar
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};
