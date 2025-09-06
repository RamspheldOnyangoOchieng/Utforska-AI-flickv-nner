import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const res = NextResponse.next()
  // Attach basic trace id for debugging
  const traceId = crypto.randomUUID()
  res.headers.set('x-trace-id', traceId)

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      // Fail open: allow request through rather than 500
      console.error('Middleware: Supabase env missing – skipping auth logic')
      return res
    }

    const supabase = createMiddlewareClient<Database>({ req, res }, { supabaseUrl, supabaseKey })
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.log('Middleware session error:', sessionError.message)
    }

    // Only attempt to refresh if we have a session
    if (session) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

      if (refreshError) {
        console.log('Middleware refresh error:', refreshError.message)
      } else if (refreshData?.session) {
        console.log('Middleware: Session refreshed successfully')
      }
    } else {
      console.log('Middleware: No session found, skipping refresh')
    }

    // Admin route protection: restrict /admin paths to admin users only
    if (url.pathname.startsWith('/admin')) {
      if (!session) {
        const redirectUrl = new URL('/middleware-error', req.url)
        redirectUrl.searchParams.set('code', 'NO_SESSION')
        redirectUrl.searchParams.set('trace', traceId)
        return NextResponse.rewrite(redirectUrl)
      }
      try {
        // Fetch profile to check is_admin flag (RLS should allow selecting own row)
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single()
        const metaRole = (session.user.user_metadata as any)?.role
        if (!profile?.is_admin && metaRole !== 'admin') {
          const redirectUrl = new URL('/middleware-error', req.url)
          redirectUrl.searchParams.set('code', 'NOT_ADMIN')
          redirectUrl.searchParams.set('trace', traceId)
          return NextResponse.rewrite(redirectUrl)
        }
      } catch (e) {
        console.error('Admin check failed', e)
        const redirectUrl = new URL('/middleware-error', req.url)
        redirectUrl.searchParams.set('code', 'ADMIN_CHECK_FAILED')
        redirectUrl.searchParams.set('trace', traceId)
        return NextResponse.rewrite(redirectUrl)
      }
    }

    // IMPORTANT: Return the response with updated cookies
    return res
  } catch (error: any) {
    console.error('Middleware fatal error (fail-open):', traceId, error)
    res.headers.set('x-middleware-error', error?.message || 'unknown')
    return res // fail-open
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
