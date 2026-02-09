import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { DashboardTabs } from '@/components/DashboardTabs';
import { ProfileRow } from '@/components/ProfileRow';
import { AddPropertyModal } from '@/components/AddPropertyModal';
import { ConfirmAppointmentButton } from '@/components/ConfirmAppointmentButton';
import { DeletePropertyButton } from '@/components/DeletePropertyButton';
import { createClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase';
import { isSuperAdmin as checkSuperAdmin } from '@/lib/constants';
import type { Property } from '@/types';
import type { LeadWithDetails } from '@/types';
import type { Profile } from '@/types';
import type { AppointmentWithDetails } from '@/types';
import { Building2, Euro, TrendingUp, Plus, MessageSquare, Users, CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const serverSupabase = await createClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  const isSuperAdmin = checkSuperAdmin(user?.email);
  const { data: currentProfile } = user
    ? await serverSupabase.from('profiles').select('role, status').eq('id', user.id).single()
    : { data: null };
  const canEdit =
    isSuperAdmin ||
    (currentProfile?.role === 'admin' && currentProfile?.status === 'approved');

  // Filtro de privacidad: asesores solo ven sus propiedades/leads/citas; Super Admin ve todo.
  let propertiesData: Property[] | null = null;
  let propertiesError: Error | null = null;
  let leadsData: Array<{ id: string; message: string; created_at: string; user_id: string; property_id: string }> | null = null;
  let appointmentsData: Array<{ id: string; property_id: string; user_id: string; appointment_date: string; appointment_time: string; notes?: string | null; created_at?: string; agent_name?: string | null; status?: string | null }> | null = null;

  if (isSuperAdmin) {
    const [pRes, lRes, aRes] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('leads').select('id, message, created_at, user_id, property_id').order('created_at', { ascending: false }).limit(100),
      supabase.from('appointments').select('id, property_id, user_id, appointment_date, appointment_time, notes, created_at, agent_name, status').order('appointment_date', { ascending: false }).limit(100),
    ]);
    propertiesData = pRes.data as Property[] | null;
    propertiesError = pRes.error ?? null;
    leadsData = lRes.data;
    appointmentsData = aRes.data;
  } else if (user?.id) {
    const pRes = await supabase
      .from('properties')
      .select('*')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    propertiesData = pRes.data as Property[] | null;
    propertiesError = pRes.error ?? null;
    const propertyIds = (pRes.data ?? []).map((p: { id: string }) => p.id);
    if (propertyIds.length > 0) {
      const [lRes, aRes] = await Promise.all([
        supabase.from('leads').select('id, message, created_at, user_id, property_id').in('property_id', propertyIds).order('created_at', { ascending: false }).limit(100),
        supabase.from('appointments').select('id, property_id, user_id, appointment_date, appointment_time, notes, created_at, agent_name, status').in('property_id', propertyIds).order('appointment_date', { ascending: false }).limit(100),
      ]);
      leadsData = lRes.data;
      appointmentsData = aRes.data;
    } else {
      leadsData = [];
      appointmentsData = [];
    }
  } else {
    propertiesData = [];
    leadsData = [];
    appointmentsData = [];
  }

  const { data: profilesData } = await supabase.from('profiles').select('id, full_name, email, role, status, phone').order('created_at', { ascending: false }).limit(200);

  const properties: Property[] = (propertiesData as Property[]) ?? [];
  const leads: Array<{ id: string; message: string; created_at: string; user_id: string; property_id: string }> = leadsData ?? [];
  const profiles: (Profile & { id: string })[] = (profilesData as (Profile & { id: string })[]) ?? [];
  const appointments: Array<{ id: string; property_id: string; user_id: string; appointment_date: string; appointment_time: string; notes?: string | null; created_at?: string; agent_name?: string | null; status?: string | null }> = appointmentsData ?? [];

  let leadsWithDetails: LeadWithDetails[] = [];
  if (leads.length > 0) {
    const userIds = [...new Set(leads.map((l) => l.user_id))];
    const propertyIds = [...new Set(leads.map((l) => l.property_id))];
    const [profilesRes, propertiesRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email').in('id', userIds),
      supabase.from('properties').select('id, title').in('id', propertyIds),
    ]);
    const profilesMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
    const propertiesMap = new Map((propertiesRes.data ?? []).map((p) => [p.id, p]));
    leadsWithDetails = leads.map((lead) => ({
      ...lead,
      profiles: profilesMap.get(lead.user_id) ?? null,
      properties: propertiesMap.get(lead.property_id) ?? null,
    }));
  }

  let appointmentsWithDetails: AppointmentWithDetails[] = [];
  if (appointments.length > 0) {
    const pIds = [...new Set(appointments.map((a) => a.property_id))];
    const uIds = [...new Set(appointments.map((a) => a.user_id))];
    const [propRes, profRes] = await Promise.all([
      supabase.from('properties').select('id, title, location').in('id', pIds),
      supabase.from('profiles').select('id, full_name, email').in('id', uIds),
    ]);
    const propMap = new Map((propRes.data ?? []).map((p) => [p.id, p]));
    const profMap = new Map((profRes.data ?? []).map((p) => [p.id, p]));
    appointmentsWithDetails = appointments.map((a) => ({
      ...a,
      properties: propMap.get(a.property_id) ?? null,
      profiles: profMap.get(a.user_id) ?? null,
    }));
  }

  const totalValue = properties.reduce((acc, p) => acc + p.price, 0);
  const avgPrice = properties.length ? Math.round(totalValue / properties.length) : 0;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
              Panel administrativo
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gestiona inventario, perfiles y citas de Elite Estate.
            </p>
          </div>
          {canEdit && (
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/25 transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <Plus className="h-4 w-4" />
              Añadir propiedad
            </Link>
          )}
        </div>

        <DashboardTabs />

        <div id="resumen" className="mb-8 scroll-mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Building2, label: 'Total propiedades', value: String(properties.length), color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
            { icon: Euro, label: 'Valor total', value: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalValue), color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
            { icon: TrendingUp, label: 'Precio medio', value: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(avgPrice), color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
            { icon: MessageSquare, label: 'Leads', value: String(leadsWithDetails.length), color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div id="citas" className="mb-8 scroll-mt-24">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
              <CalendarDays className="h-5 w-5 text-amber-500" />
              Citas
            </h2>
            {appointmentsWithDetails.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-lg backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800/80">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Cliente</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Propiedad</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Asesor asignado</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Fecha / Hora</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {appointmentsWithDetails.map((apt) => (
                      <tr key={apt.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          {apt.profiles?.full_name ?? apt.profiles?.email ?? 'Cliente'}
                        </td>
                        <td className="px-4 py-3 text-amber-600 dark:text-amber-400">
                          {apt.properties?.title ?? apt.property_id}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {apt.agent_name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {apt.appointment_date} {apt.appointment_time}
                        </td>
                        <td className="px-4 py-3">
                          {apt.status !== 'confirmed' && (
                            <ConfirmAppointmentButton appointmentId={apt.id} />
                          )}
                          {apt.status === 'confirmed' && (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Confirmada</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            ) : (
              <p className="rounded-2xl border border-slate-200/80 bg-white/80 py-6 text-center text-sm text-slate-500 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-400">
                No hay solicitudes de cita.
              </p>
            )}
          </div>

        <div id="gestion-asesores" className="mb-8 scroll-mt-24">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <Users className="h-5 w-5 text-amber-500" />
            Gestión de Asesores
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-lg backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/80">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Nombre / Email</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Email</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Teléfono</th>
                    {isSuperAdmin && <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Estado</th>}
                    {isSuperAdmin && <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Rol</th>}
                    <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {profiles.length === 0 && (
                    <tr>
                      <td colSpan={isSuperAdmin ? 6 : 4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                        No hay perfiles registrados.
                      </td>
                    </tr>
                  )}
                  {profiles.map((p) => {
                    const displayRole: 'Super Admin' | 'Asesor' | 'Cliente' =
                      checkSuperAdmin((p as Profile & { email?: string }).email)
                        ? 'Super Admin'
                        : (p as Profile).role === 'admin'
                          ? 'Asesor'
                          : 'Cliente';
                    return (
                      <ProfileRow
                        key={p.id}
                        profile={p as Profile & { id: string; email?: string; full_name?: string; role: string; status: string; phone?: string }}
                        canManageAsesores={isSuperAdmin}
                        showSensitiveColumns={isSuperAdmin}
                        displayRole={displayRole}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="leads" className="mb-8 scroll-mt-24">
            <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">Mensajes (leads)</h2>
            {leadsWithDetails.length > 0 ? (
            <div className="space-y-2">
              {leadsWithDetails.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    El usuario <span className="text-amber-600 dark:text-amber-400">{lead.profiles?.full_name ?? lead.profiles?.email ?? lead.user_id}</span> está interesado en la propiedad <span className="text-amber-600 dark:text-amber-400">{lead.properties?.title ?? lead.property_id}</span>.
                  </p>
                  {lead.message && <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">&quot;{lead.message}&quot;</p>}
                  {lead.created_at && <p className="mt-1 text-xs text-slate-400">{new Date(lead.created_at).toLocaleString('es-ES')}</p>}
                </div>
              ))}
            </div>
            ) : (
              <p className="rounded-2xl border border-slate-200/80 bg-white/80 py-6 text-center text-sm text-slate-500 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-400">
                No hay leads aún.
              </p>
            )}
          </div>

        <div id="inventario" className="scroll-mt-24 space-y-0 rounded-2xl border border-slate-200/80 bg-white/80 shadow-lg backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3 dark:border-slate-700/80">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Inventario</h2>
            {canEdit && <AddPropertyModal />}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Título</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Ubicación</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Precio</th>
                  <th className="hidden sm:table-cell px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Hab.</th>
                  <th className="hidden sm:table-cell px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Baños</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Estado</th>
                  {canEdit && <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {properties.length === 0 && (
                  <tr>
                    <td colSpan={canEdit ? 7 : 6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No hay propiedades. Usa el botón «Añadir propiedad» para crear una.
                    </td>
                  </tr>
                )}
                {properties.map((p) => {
                  const canEditThis = isSuperAdmin || p.agent_id === user?.id;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="max-w-[200px] px-4 py-3 font-medium text-slate-900 dark:text-white">
                        <Link href={`/properties/${p.id}`} className="hover:text-amber-600 dark:hover:text-amber-400">{p.title}</Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.location}</td>
                      <td className="px-4 py-3 font-semibold text-amber-600 dark:text-amber-400">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p.price)}
                      </td>
                      <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-400 sm:table-cell">{p.beds}</td>
                      <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-400 sm:table-cell">{p.baths}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.status}</td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          {canEditThis ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/properties/${p.id}/edit`}
                                className="inline-flex items-center gap-1 rounded-xl bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/20"
                              >
                                Editar
                              </Link>
                              <DeletePropertyButton propertyId={p.id} propertyTitle={p.title} />
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {propertiesError && (
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              Error al cargar datos desde Supabase.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
