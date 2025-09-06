import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
  const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: "not_admin" }, { status: 403 })
    }

    // Get admin settings
    const { data: settings, error: settingsError } = await supabase.from("admin_settings").select("*").single()

    if (settingsError && settingsError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error fetching admin settings:", settingsError)
      return NextResponse.json({ error: "database_error" }, { status: 500 })
    }

    return NextResponse.json({ settings: settings || {} })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { settings } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: "not_admin" }, { status: 403 })
    }

    // Save admin settings
    const { error: saveError } = await supabase.from("admin_settings").upsert({
      id: 1, // Assuming there's only one settings record
      ...settings,
      updated_at: new Date().toISOString(),
    })

    if (saveError) {
      console.error("Error saving admin settings:", saveError)
      return NextResponse.json({ error: "database_error" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
