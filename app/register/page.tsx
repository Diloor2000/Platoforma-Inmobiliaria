'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { Navbar } from '@/components/Navbar';
import { createProfileOnRegister } from '@/app/actions/auth';
import { SUPER_ADMIN_PHONE } from '@/lib/constants';
import { buildWhatsAppUrl, formatPhoneEcuador } from '@/lib/whatsapp';
import { UserPlus, Mail, Lock, User, Briefcase, Phone } from 'lucide-react';

const MIN_LENGTH = 8;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

function validatePassword(pwd: string): string | null {
  if (!pwd) return null;
  if (pwd.length < MIN_LENGTH)
    return `Mínimo ${MIN_LENGTH} caracteres`;
  if (!HAS_UPPERCASE.test(pwd))
    return 'Al menos una letra mayúscula';
  if (!HAS_NUMBER.test(pwd))
    return 'Al menos un número';
  if (!HAS_SPECIAL.test(pwd))
    return 'Al menos un símbolo especial (!@#$%^&* etc.)';
  return null;
}

type UserType = 'cliente' | 'corredor';

export const RegisterPage = () => {
  const [userType, setUserType] = useState<UserType>('cliente');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const passwordError = useMemo(() => validatePassword(password), [password]);
  const canSubmit = !passwordError && password.length >= MIN_LENGTH && (userType === 'cliente' || phone.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordError || !canSubmit) {
      showToast(passwordError || (userType === 'corredor' && !phone.trim() ? 'El teléfono es obligatorio para corredores' : 'La contraseña no cumple los requisitos'), 'error');
      return;
    }
    if (userType === 'corredor' && !phone.trim()) {
      showToast('El número de teléfono es obligatorio para corredores', 'error');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (signUpError) {
      setLoading(false);
      showToast(signUpError.message, 'error');
      return;
    }
    if (data.user) {
      const isCliente = userType === 'cliente';
      const profileData = {
        id: data.user.id,
        email: data.user.email ?? email,
        full_name: fullName || null,
        role: isCliente ? 'user' : 'admin',
        status: isCliente ? 'approved' : 'pending_approval',
        ...(userType === 'corredor' && phone.trim() ? { phone: phone.trim() } : {}),
      };
      const { error: profileError } = await supabase.from('profiles').upsert(profileData, { onConflict: 'id' });
      setLoading(false);
      if (profileError) {
        const fallback = await createProfileOnRegister(
          data.user.id,
          data.user.email ?? email,
          fullName,
          userType,
          phone.trim() || undefined
        );
        if (fallback.error) {
          showToast(profileError.message || fallback.error, 'error');
          return;
        }
      }
      if (isCliente) {
        showToast('Registro exitoso. Bienvenido a Elite Estate.', 'success');
        router.replace('/');
      } else {
        const phoneFormatted = formatPhoneEcuador(phone) ? `+${formatPhoneEcuador(phone)}` : (phone.trim() || '—');
        const msg = `Hola Admin, un nuevo corredor se ha registrado en Elite Estate. Nombre: ${fullName || email}, Teléfono: ${phoneFormatted}. Por favor, revisa el Dashboard para aprobarlo.`;
        const whatsappUrl = buildWhatsAppUrl(SUPER_ADMIN_PHONE, msg);
        if (whatsappUrl) window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        showToast('Registro exitoso. Tu perfil profesional está en revisión.', 'success');
        router.replace('/espera');
      }
      router.refresh();
    } else {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto flex max-w-md flex-col justify-center px-4 py-20 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-2xl shadow-slate-300/20 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 dark:shadow-slate-950/50 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-500 dark:bg-amber-400/10">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
                Crear cuenta
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Únete a Elite Estate como cliente o corredor inmobiliario.
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={() => setUserType('cliente')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                userType === 'cliente'
                  ? 'bg-white text-amber-600 shadow-md dark:bg-slate-700 dark:text-amber-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              Soy Cliente
            </button>
            <button
              type="button"
              onClick={() => setUserType('corredor')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                userType === 'corredor'
                  ? 'bg-white text-amber-600 shadow-md dark:bg-slate-700 dark:text-amber-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Soy Corredor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <User className="h-4 w-4" />
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-900"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-900"
                placeholder="tu@email.com"
              />
            </div>
            {userType === 'corredor' && (
              <div>
                <label htmlFor="phone" className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <Phone className="h-4 w-4" />
                  Número de Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => {
                    const formatted = formatPhoneEcuador(phone);
                    if (formatted && phone.trim()) setPhone('+' + formatted);
                  }}
                  required
                  autoComplete="tel"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-900"
                  placeholder="099 123 4567 o +593 99 123 4567"
                />
              </div>
            )}
            <div>
              <label htmlFor="password" className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <Lock className="h-4 w-4" />
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={MIN_LENGTH}
                autoComplete="new-password"
                className={`mt-1 w-full rounded-2xl border bg-slate-50 px-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-900 ${
                  passwordError
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-500 dark:focus:border-red-500'
                    : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/20 dark:border-slate-700 dark:focus:border-amber-400'
                }`}
                placeholder="Mín. 8 caracteres, mayúscula, número y símbolo"
              />
              {passwordError && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400" role="alert">
                  {passwordError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full rounded-2xl bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/25 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-slate-900"
            >
              {loading ? 'Creando cuenta...' : 'Registrarme'}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-amber-500 hover:text-amber-600 dark:text-amber-400">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;
