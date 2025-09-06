import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Lazy factory so build does not crash if env vars missing; validated at request time only.
function getServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error("Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL")
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(request: Request) {
  try {
    // Get the user's token from the request
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: No valid authorization header" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Verify the token and get the user
  const supabaseAdmin = getServiceClient()
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError) {
      return NextResponse.json(
        {
          error: "Authentication error",
          details: authError.message,
        },
        { status: 401 },
      )
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized: No user found" }, { status: 401 })
    }

    // Check if the user is an admin
    // Server-side admin check (no reliance on client-only localStorage code)
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()
    if (profileErr) {
      return NextResponse.json({ error: "Failed to verify admin status", details: profileErr.message }, { status: 500 })
    }
    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden: User is not an admin" }, { status: 403 })
    }

    // Create the table directly using SQL
  const { error } = await supabaseAdmin.from("stripe_keys").select("id", { count: "exact", head: true })

    // If the table already exists, we're done
    if (!error || error.code !== "PGRST116") {
      return NextResponse.json({ success: true, message: "Table already exists" })
    }

    // Create the table using SQL
    const { error: createError } = await supabaseAdmin.rpc("create_stripe_keys_table")

    if (createError) {
      console.error("Error creating stripe_keys table via function:", createError)
      return NextResponse.json({ error: 'Creation function failed', details: createError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in migration API:", error)
    return NextResponse.json(
      {
        error: "Server error during migration",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
