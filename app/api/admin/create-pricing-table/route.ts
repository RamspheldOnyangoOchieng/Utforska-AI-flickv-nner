import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createClient()

    // Check if the user is authenticated and an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is an admin
    const { data: adminData } = await supabase.from("admins").select("id").eq("user_id", user.id).single()

    if (!adminData) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Call the create_pricing_table function
    const { data, error } = await supabase.rpc("create_pricing_table")

    if (error) {
      console.error("Error creating pricing table:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Pricing table created successfully" })
  } catch (error) {
    console.error("Error in create-pricing-table route:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
