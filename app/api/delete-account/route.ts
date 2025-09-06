import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// Server-side account deletion with optional feedback.
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const feedback: string | null = body.feedback ?? null

  try {
    if (feedback) {
      await supabase.from('delete_feedback').insert({ user_id: user.id, feedback })
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL

    if (serviceKey && supabaseUrl) {
      const admin = createServiceClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
      const { error } = await (admin as any).auth.admin.deleteUser(user.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      // Fallback: anonymize profile if hard delete not possible
      await supabase.from('profiles').update({ display_name: 'Deleted User', bio: null }).eq('id', user.id)
    }

    return NextResponse.json({ ok: true, deleted: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 })
  }
}