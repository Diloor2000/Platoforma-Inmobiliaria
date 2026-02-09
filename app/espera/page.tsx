import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Clock, Sparkles } from 'lucide-react';

export default function EsperaPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-2xl shadow-slate-300/20 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 dark:shadow-slate-950/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-500 dark:bg-amber-400/10">
            <Clock className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Tu cuenta está siendo revisada por un administrador
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Hemos recibido tu solicitud. Un administrador revisará tu perfil y
            te notificaremos cuando puedas acceder al panel de asesores.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-amber-400/10 px-4 py-3 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">
              Gracias por unirte a Elite Estate
            </span>
          </div>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Si tienes alguna duda, contacta con el administrador.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/25 transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
