import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  const cookieStore = await cookies();
  const hasAuthCookie =
    cookieStore.has("sb-access-token") || cookieStore.has("sb-refresh-token") || cookieStore.has("supabase-auth-token")

  return NextResponse.json({
    authenticated: hasAuthCookie,
  })
}
