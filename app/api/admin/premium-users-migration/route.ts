import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })

    // Verify admin status
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData } = await supabase.from("admins").select("*").eq("user_id", user.id).single()

    if (!adminData) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Run the migration using SQL
    const { error: migrationError } = await supabase.rpc("ensure_premium_user_columns")

    if (migrationError) {
      console.error("Migration error:", migrationError)
      return NextResponse.json({ error: `Error running migration: ${migrationError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in premium users migration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
