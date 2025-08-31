import { NextResponse } from "next/server"

export async function GET() {
  const mask = (v?: string | null) => (v ? `${v.slice(0, 8)}… (${v.length} chars)` : null)

  const body = {
    nodeEnv: process.env.NODE_ENV,
    // Public envs (safe to expose structure)
    NEXT_PUBLIC_SUPABASE_URL: mask(process.env.NEXT_PUBLIC_SUPABASE_URL || null),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: mask(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null),
    // Server-only envs (presence only)
    has_SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    has_STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
    has_STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    // File origin hint (Next loads .env.local > .env.* > .env). Can't know source, but echo presence.
    loadedKeys: Object.keys(process.env).filter((k) =>
      [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
      ].includes(k),
    ),
  }

  return NextResponse.json(body)
}
