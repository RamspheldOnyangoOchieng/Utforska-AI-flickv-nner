import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Create a Supabase client with admin privileges
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

    // SQL to add the video_url column if it doesn't exist
    const sql = `
      ALTER TABLE characters 
      ADD COLUMN IF NOT EXISTS video_url TEXT;
      
      COMMENT ON COLUMN characters.video_url IS 'URL to the character video that plays on hover';
    `

    // Execute the SQL
    const { error } = await supabaseAdmin.rpc("pgclient", { query: sql })

    if (error) {
      console.error("Migration error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "video_url column added successfully" })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
