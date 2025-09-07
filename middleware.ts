import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  let res = NextResponse.next()

  const logs: string[] = []
  const traceId = (globalThis.crypto && 'randomUUID' in globalThis.crypto) ? (globalThis.crypto as any).randomUUID() : Math.random().toString(36).slice(2)
  const debugParam = url.searchParams.get('__mwdebug') === '1'
  const debugEnv = process.env.NEXT_PUBLIC_MW_DEBUG === '1'
  const debug = debugParam || debugEnv

  function log(msg: string) { logs.push(msg); if (debug) console.log('[MW]', msg) }
  res.headers.set('x-trace-id', traceId)
  if (debug) res.headers.set('x-mw-debug', '1')

  try {
    log('start')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
      log('env-missing skip auth')
      return res
    }

    // Simple supabase client for middleware
    const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    log('middleware-configured')

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      log('session-error ' + sessionError.message)
    }

    // Admin route protection: restrict /admin paths to admin users only
    if (url.pathname.startsWith('/admin')) {
      if (!session) {
        log('admin-no-session')
        if (debug) {
          return new NextResponse(JSON.stringify({ code: 'NO_SESSION', traceId, logs }), { status: 401, headers: { 'content-type': 'application/json' } })
        }
        return res
      }
      try {
        // Fetch profile to check is_admin flag (RLS should allow selecting own row)
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single()
        const metaRole = (session.user.user_metadata as any)?.role
        if (!profile?.is_admin && metaRole !== 'admin') {
          log('not-admin')
          if (debug) {
            return new NextResponse(JSON.stringify({ code: 'NOT_ADMIN', traceId, logs, metaRole, profile }), { status: 403, headers: { 'content-type':'application/json' } })
          }
          return res
        }
      } catch (e) {
        log('admin-check-failed ' + (e as any)?.message)
        if (debug) {
          return new NextResponse(JSON.stringify({ code: 'ADMIN_CHECK_FAILED', traceId, error: (e as any)?.message, logs }), { status: 500, headers: { 'content-type':'application/json' } })
        }
        return res
      }
    }

    // IMPORTANT: Return the response with updated cookies
    log('end')
    if (debug) {
      res.headers.set('x-mw-logs', encodeURIComponent(logs.join(';')))
    }
    return res
    
  } catch (error: any) {
    log('middleware-error: ' + error.message)
    if (debug) {
      res.headers.set('x-mw-logs', logs.join('|'))
    }
    return res
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
