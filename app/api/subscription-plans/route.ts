import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase.from("subscription_plans").select("*").order("duration", { ascending: true })

    if (error) {
      console.error("Error fetching subscription plans:", error)
      return NextResponse.json({ error: "Failed to fetch subscription plans" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error fetching subscription plans:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
