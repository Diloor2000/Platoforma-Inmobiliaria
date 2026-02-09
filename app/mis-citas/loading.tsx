import { Navbar } from '@/components/Navbar';

export default function MisCitasLoading() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto max-w-2xl px-4 pt-24 pb-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl dark:border-slate-700/80 dark:bg-slate-900/80 sm:p-8">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="mt-4 h-4 w-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          <div className="mt-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/50"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
