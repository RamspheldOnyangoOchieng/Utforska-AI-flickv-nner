import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  // Read env at build-time (inlined by Next). Guard missing values to avoid crashes during dev/build.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Middleware Supabase env missing. Define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL/SUPABASE_ANON_KEY).",
    )
    return res
  }

  // Explicitly pass Supabase config to avoid reliance on env discovery in edge/middleware
  const supabase = createMiddlewareClient<Database>({ req, res }, {
    supabaseUrl,
    supabaseKey,
  })

  try {
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

    // IMPORTANT: Return the response with updated cookies
    return res
  } catch (error) {
    console.error('Middleware error:', error)
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
