import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const supabase = createClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ authenticated: false, isAdmin: false, error: "Not authenticated" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", session.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return NextResponse.json(
        { authenticated: true, isAdmin: false, error: "Error fetching profile" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      authenticated: true,
      isAdmin: profile?.is_admin || false,
      userId: session.user.id,
      email: session.user.email,
    })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ authenticated: false, isAdmin: false, error: "Server error" }, { status: 500 })
  }
}
