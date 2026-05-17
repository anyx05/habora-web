import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// 1. Create the internationalization router
const handleI18nRouting = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 2. Process locale routing first (resolves /en/, /et/ paths based on headers)
  const response = handleI18nRouting(request);

  // 3. Setup Supabase to attach to the response the i18n router just generated
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add any logic between createServerClient and
  // supabase.auth.getUser().
  
  // 4. Secure the Dashboard routes (strict path match for /[locale]/dashboard*)
  const isDashboardRoute = /^\/[a-z]{2}\/dashboard(\/|$)/.test(request.nextUrl.pathname);

  if (isDashboardRoute) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      const url = request.nextUrl.clone();
      // Redirect to root login page, next-intl will automatically apply the locale prefix
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profile?.role !== 'port_operator') {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (Next.js internals)
     * - _vercel (Vercel internals)
     * - static files (dots in name)
     */
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
