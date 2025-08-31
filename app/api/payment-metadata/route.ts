import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from("payment_metadata")
      .select("metadata")
      .eq("session_id", sessionId)
      .single()

    if (error) {
      console.error("Error fetching payment metadata:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch payment metadata" }, { status: 500 })
    }

    return NextResponse.json({ success: true, metadata: data })
  } catch (error) {
    console.error("Error in payment-metadata API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { session_id, metadata } = body

    if (!session_id || !metadata) {
      return NextResponse.json({ error: "Session ID and metadata are required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Upsert metadata
    const { data, error } = await supabase
      .from("payment_metadata")
      .upsert(
        {
          session_id,
          metadata,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "session_id" },
      )
      .select()

    if (error) {
      console.error("Error storing payment metadata:", error)
      return NextResponse.json({ success: false, error: "Failed to store payment metadata" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in payment-metadata API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
