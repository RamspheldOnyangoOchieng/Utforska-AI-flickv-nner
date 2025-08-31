import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getStripeKeys } from "@/lib/stripe-utils"

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
    const isAdmin = await isUserAdmin(supabase, session.user.id)

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get the Stripe keys
    const keys = await getStripeKeys()

    // Return a sanitized version of the configuration
    return NextResponse.json({
      mode: keys.liveMode ? "live" : "test",
      hasPublishableKey: !!keys.publishableKey,
      hasSecretKey: !!keys.secretKey,
      publishableKeyPrefix: keys.publishableKey ? keys.publishableKey.substring(0, 8) + "..." : null,
    })
  } catch (error: any) {
    console.error("Error in GET /api/admin/stripe-config:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
