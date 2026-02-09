'use client';

import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

export const Hero = () => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <section className="relative min-h-[420px] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 sm:min-h-[480px] lg:min-h-[520px]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 dark:opacity-20"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-slate-50/70 to-slate-50 dark:from-slate-950/90 dark:via-slate-950/70 dark:to-slate-950" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-4 pt-28 pb-16 text-center sm:px-6 sm:pt-36 lg:px-8 lg:pt-40">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
          Encuentra tu propiedad de lujo
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
          Inversión inmobiliaria premium. Analiza y compara propiedades exclusivas
          con datos claros y experiencia elegante.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xl">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-2xl shadow-slate-300/30 ring-1 ring-slate-200/80 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-slate-950/50 dark:ring-slate-700/80 sm:flex-row sm:p-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800/50 dark:focus-within:border-amber-400 dark:focus-within:bg-slate-900">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400 dark:text-amber-400/80" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ciudad, zona o código postal"
                className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/30 transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
