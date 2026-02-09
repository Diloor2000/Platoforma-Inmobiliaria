import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPER_ADMIN_EMAIL } from '@/lib/constants';

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isLogin = request.nextUrl.pathname.startsWith('/login');
  const isEspera = request.nextUrl.pathname === '/espera';
  const isMisCitas = request.nextUrl.pathname === '/mis-citas';
  const isNewProperty = request.nextUrl.pathname === '/properties/new';
  const isEditProperty = /^\/properties\/[^/]+\/edit$/.test(request.nextUrl.pathname);

  if (isEditProperty && !user) {
    const redirectEdit = new URL('/login', request.url);
    redirectEdit.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectEdit);
  }

  if (isMisCitas && !user) {
    const redirect = new URL('/login', request.url);
    redirect.searchParams.set('redirectTo', '/mis-citas');
    return NextResponse.redirect(redirect);
  }

  if (isNewProperty && !user) {
    const redirect = new URL('/login', request.url);
    redirect.searchParams.set('redirectTo', '/properties/new');
    return NextResponse.redirect(redirect);
  }
  if (isNewProperty && user) {
    const isSuperAdminNew = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    if (!isSuperAdminNew) {
      const { data: profileNew } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single();
      const canEditNew =
        profileNew?.role === 'admin' && profileNew?.status === 'approved';
      if (!canEditNew) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  if (isDashboard && !user) {
    const redirect = new URL('/login', request.url);
    redirect.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirect);
  }

  if (isDashboard && user) {
    const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    if (isSuperAdmin) {
      return response;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'user') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    const isApprovedAdmin = profile?.role === 'admin' && profile?.status === 'approved';
    if (!isApprovedAdmin) {
      return NextResponse.redirect(new URL('/espera', request.url));
    }
  }

  if (isLogin && user) {
    const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    if (isSuperAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();
    if (profile?.role === 'admin' && profile?.status === 'approved') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    const isPending = profile?.status === 'pending' || profile?.status === 'pending_approval';
    if (profile?.role === 'admin' && isPending) {
      return NextResponse.redirect(new URL('/espera', request.url));
    }
    if (profile?.role === 'admin' && profile?.status === 'rejected') {
      return NextResponse.redirect(new URL('/espera', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
};
