import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// Helper function to check if a user is an admin
async function isUserAdmin(supabase: any, userId: string) {
  try {
    // Direct query to admin_users table
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

export async function POST(request: NextRequest) {
  try {
    // Get the session using the route handler client
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookies() })

    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is an admin
    const isAdmin = await isUserAdmin(supabase, session.user.id)

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create the stripe_keys table
    const { error } = await supabase.rpc("create_stripe_keys_table")

    if (error) {
      console.error("Error creating stripe_keys table:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in POST /api/admin/create-stripe-keys-table:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
