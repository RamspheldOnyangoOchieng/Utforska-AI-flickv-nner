import { createAdminClient } from "@/lib/supabase-admin"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = await createAdminClient()

    // Prefer user_id from query param, fallback to anonymousId
    const userId = request.nextUrl.searchParams.get("user_id")
    const anonymousId =
      request.cookies.get("anonymous_id")?.value || request.nextUrl.searchParams.get("anonymous_id") || "anonymous"
    const idToUse = userId || anonymousId

    // Query images for the user
    const { data, error } = await supabaseAdmin
      .from("generated_images")
      .select("*")
      .eq("user_id", idToUse)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user images:", error)
      return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
    }

    return NextResponse.json({ images: data || [] })
  } catch (error) {
    console.error("Error in user-images API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
