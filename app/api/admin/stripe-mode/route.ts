import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

// Helper function to check if a user is an admin
async function isUserAdmin(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase.from("admin_users").select("id").eq("user_id", userId).single()

    if (error) {
      console.error("Error checking admin status:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error in isUserAdmin:", error)
    return false
  }
}

// Helper function to verify admin status from headers as a fallback
async function verifyAdminFromHeaders(supabase: any, request: NextRequest) {
  const userId = request.headers.get("X-User-Id")
  const userEmail = request.headers.get("X-User-Email")

  if (!userId) return false

  // First try the standard way
  const isAdmin = await isUserAdmin(supabase, userId)
  if (isAdmin) return true

  // Fallback: check if this is a known admin email
  if (userEmail === "admin@example.com") {
    return true
  }

  return false
}

// Create a Supabase admin client with service role to bypass RLS (no user session, direct service key)
function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase environment variables for admin client")
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Ensure a single settings row exists; return its boolean.
async function ensureAndGetStripeMode() {
  const admin = createSupabaseAdmin()
  const key = "stripe_mode"
  // Fetch existing
  const { data, error } = await admin.from("settings").select("id, value").eq("key", key).limit(1)
  if (error) throw error
  if (!data || data.length === 0) {
    const { error: insertError } = await admin.from("settings").insert({ key, value: { live: false } })
    if (insertError && !insertError.message.includes("duplicate")) throw insertError
    return false
  }
  return data[0].value?.live === true
}

async function setStripeMode(live: boolean) {
  const admin = createSupabaseAdmin()
  const key = "stripe_mode"
  const { error } = await admin.from("settings").upsert({ key, value: { live } }, { onConflict: "key" })
  if (error) throw error
  return live
}

// Define a type for the authentication result
type AuthResult = {
  success: boolean
  status?: number
  error?: string
}

// Verify the user is authenticated and is an admin
async function verifyAdminAuth(request: NextRequest): Promise<AuthResult> {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const userId = session?.user?.id
  let isAdmin = false

  if (userId) {
    isAdmin = await isUserAdmin(supabase, userId)
  }

  if (!isAdmin) {
    isAdmin = await verifyAdminFromHeaders(supabase, request)

    if (!isAdmin) {
      console.log("Unauthorized access attempt")
      return { success: false, status: 401, error: "Unauthorized" }
    }
  }

  return { success: true }
}

export async function GET(request: import("next/server").NextRequest) {
  try {
    // Get the admin client with service role permissions
  // Verify the user is authenticated and is an admin
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }
  const liveMode = await ensureAndGetStripeMode()
  return NextResponse.json({ success: true, liveMode, source: "settings" })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 })
  }
}

export async function POST(request: import("next/server").NextRequest) {
  try {
    // Get the admin client with service role permissions
  // Verify the user is authenticated and is an admin
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Get the request body
    const body = await request.json()
    const { liveMode } = body

  const updated = await setStripeMode(!!liveMode)
  return NextResponse.json({ success: true, liveMode: updated, message: `Stripe mode set to ${updated ? "live" : "test"}` })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 })
  }
}
