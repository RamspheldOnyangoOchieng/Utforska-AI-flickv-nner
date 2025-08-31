import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase admin client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

// Helper function to check if a user is an admin
async function isUserAdmin(userId: string) {
  try {
    // Direct query to admin_users table using the admin client to bypass RLS
    const { data, error } = await supabaseAdmin.from("admin_users").select("id").eq("user_id", userId).single()

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

export async function GET(request: NextRequest) {
  try {
    // Get the session using the route handler client
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is an admin
    const isAdmin = await isUserAdmin(session.user.id)

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Use the admin client to fetch stripe keys (bypassing RLS)
    const { data, error } = await supabaseAdmin.from("stripe_keys").select("*")

    if (error) {
      console.error("Error fetching stripe keys:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data && data.length > 0 ? data[0] : {})
  } catch (error: any) {
    console.error("Error in GET /api/admin/stripe-keys:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the session using the route handler client
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is an admin
    const isAdmin = await isUserAdmin(session.user.id)

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get the request body
    const body = await request.json()

    const { id, test_publishable_key, test_secret_key, live_publishable_key, live_secret_key } = body

    const keysData = {
      test_publishable_key,
      test_secret_key,
      live_publishable_key,
      live_secret_key,
      updated_at: new Date().toISOString(),
    }

    let result

    // Use the admin client to update or insert stripe keys (bypassing RLS)
    if (id) {
      // Update existing record
      result = await supabaseAdmin.from("stripe_keys").update(keysData).eq("id", id).select("id").single()
    } else {
      // Insert new record
      result = await supabaseAdmin
        .from("stripe_keys")
        .insert([
          {
            ...keysData,
            created_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single()
    }

    if (result.error) {
      console.error("Error saving stripe keys:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error: any) {
    console.error("Error in POST /api/admin/stripe-keys:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
