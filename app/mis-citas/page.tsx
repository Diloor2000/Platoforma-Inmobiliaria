import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MisCitasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/mis-citas');

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, property_id, appointment_date, appointment_time, notes, created_at')
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: true });

  const appointmentsList = appointments ?? [];
  const propertyIds = [...new Set(appointmentsList.map((a) => a.property_id))];
  const { data: propertiesData } =
    propertyIds.length > 0
      ? await supabase.from('properties').select('id, title, location').in('id', propertyIds)
      : { data: [] };
  const propertiesMap = new Map((propertiesData ?? []).map((p) => [p.id, p]));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto max-w-2xl px-4 pt-24 pb-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 sm:p-8">
          <h1 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
            <CalendarDays className="h-6 w-6 text-amber-500" />
            Mis Citas
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Citas de visita que has agendado.
          </p>
          {appointmentsList.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/80 py-10 text-center dark:border-slate-700/80 dark:bg-slate-800/50">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No tienes citas agendadas.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/25 hover:bg-amber-500"
              >
                Ver propiedades
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {appointmentsList.map((apt) => {
                const prop = propertiesMap.get(apt.property_id);
                return (
                  <li
                    key={apt.id}
                    className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 py-4 px-4 dark:border-slate-700/80 dark:bg-slate-800/50"
                  >
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {apt.appointment_date}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">{apt.appointment_time}</span>
                    <span className="text-slate-400 dark:text-slate-500">·</span>
                    <Link
                      href={`/properties/${apt.property_id}`}
                      className="font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
                    >
                      {prop?.title ?? 'Propiedad'}
                    </Link>
                    {prop?.location && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({prop.location})
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
