'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/ThemeProvider';
import { SUPER_ADMIN_EMAIL } from '@/lib/constants';
import type { User } from '@supabase/supabase-js';
import { Moon, Sun } from 'lucide-react';

type ProfileRole = 'admin' | 'user';
type ProfileStatus = string;

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ role: ProfileRole; status: ProfileStatus } | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    const supabase = createClient();
    supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setProfile(data ?? null));
  }, [user?.id]);

  const isSuperAdmin = user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isApprovedAdvisor =
    isSuperAdmin || (profile?.role === 'admin' && profile?.status === 'approved');
  const isClient = profile?.role === 'user';

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-slate-50/95 shadow-lg backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-900 transition hover:opacity-90 dark:text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-400 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/30">
            E
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Elite Estate
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Inicio
          </Link>

          {user && isClient && (
            <Link
              href="/mis-citas"
              className="hidden text-sm font-medium text-slate-600 hover:text-amber-500 dark:text-slate-400 sm:inline-block"
            >
              Mis Citas
            </Link>
          )}
          {user && isApprovedAdvisor && (
            <>
              <Link
                href="/dashboard"
                className="hidden text-sm font-medium text-slate-600 hover:text-amber-500 dark:text-slate-400 sm:inline-block"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard#inventario"
                className="hidden text-sm font-medium text-slate-600 hover:text-amber-500 dark:text-slate-400 sm:inline-block"
              >
                Inventario
              </Link>
            </>
          )}

          {user ? (
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-md hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cerrar sesión
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden text-sm font-medium text-slate-600 hover:text-amber-500 dark:text-slate-400 sm:inline-block"
              >
                Registrarse
              </Link>
              <Link
                href="/login"
                className="rounded-2xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/25 transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Acceso
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
export { Navbar };
