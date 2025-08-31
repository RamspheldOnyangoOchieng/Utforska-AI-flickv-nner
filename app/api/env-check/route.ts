import { NextResponse } from "next/server"

export async function GET() {
  const mask = (v?: string | null) => (v ? `${v.slice(0, 8)}… (${v.length} chars)` : null)

  const body = {
    nodeEnv: process.env.NODE_ENV,
    // Public envs (safe to display masked)
    NEXT_PUBLIC_SUPABASE_URL: mask(process.env.NEXT_PUBLIC_SUPABASE_URL || null),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null),
    // Server-only envs (presence only)
    has_SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    has_SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
    has_SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    // Helpful echo of which of the above keys are present
    presentKeys: [
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL ? ["NEXT_PUBLIC_SUPABASE_URL"] : []),
      ...(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? ["NEXT_PUBLIC_SUPABASE_ANON_KEY"] : []),
      ...(process.env.SUPABASE_URL ? ["SUPABASE_URL"] : []),
      ...(process.env.SUPABASE_ANON_KEY ? ["SUPABASE_ANON_KEY"] : []),
      ...(process.env.SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : []),
    ],
  }

  return NextResponse.json(body)
}
