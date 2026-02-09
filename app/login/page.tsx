'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { Navbar } from '@/components/Navbar';
import { SUPER_ADMIN_EMAIL } from '@/lib/constants';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/';
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      showToast(signInError.message, 'error');
      return;
    }
    if (data.user) {
      const isSuperAdmin = data.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      if (isSuperAdmin) {
        router.replace(redirectTo.startsWith('/dashboard') ? redirectTo : '/dashboard');
        router.refresh();
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', data.user.id)
        .single();
      if (profile?.role === 'admin' && profile?.status === 'approved') {
        router.replace(redirectTo.startsWith('/dashboard') ? redirectTo : '/dashboard');
      } else if (profile?.role === 'admin' && (profile?.status === 'pending' || profile?.status === 'pending_approval' || profile?.status === 'rejected')) {
        router.replace('/espera');
      } else {
        router.replace(redirectTo === '/dashboard' ? '/' : redirectTo);
      }
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto flex max-w-md flex-col justify-center px-4 py-20 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-2xl shadow-slate-300/20 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 dark:shadow-slate-950/50 sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
            Acceso a Elite Estate
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Inicia sesión para acceder al panel o enviar consultas.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-900"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-900"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/25 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-slate-900"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-amber-500 dark:hover:text-amber-400">
              Volver al inicio
            </Link>
            {' · '}
            <Link href="/register" className="font-medium text-amber-500 hover:text-amber-600 dark:text-amber-400">
              Registrarse
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
