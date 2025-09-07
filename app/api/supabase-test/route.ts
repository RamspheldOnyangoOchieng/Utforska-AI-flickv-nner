import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Simple test - try to get the current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error("Supabase auth error:", error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({ 
      success: true, 
      hasSession: !!session,
      timestamp: new Date().toISOString(),
      message: "Supabase connection working correctly"
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
