import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'

// Uses service role key (must NOT be exposed to client). Set SUPABASE_SERVICE_ROLE_KEY in server env only.
export async function POST(req: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  if (!serviceKey || !url) return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })
  const { userId } = await req.json().catch(()=>({}))
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  const admin = createServerClient(url, serviceKey)
  try {
    // Direct delete via auth admin API (requires service role). supabase-js v2 uses auth.admin
    const { error } = await (admin as any).auth.admin.deleteUser(userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}