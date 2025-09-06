import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

// Simple in-memory cache with expiration
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute cache

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ authenticated: false, isPremium: false }, { status: 200 })
    }

    const userId = session.user.id

    // Direct query to profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("user_id", userId)
      .single()

    if (profileError) {
      // If profile not found, try to create one
      if (profileError.code === "PGRST116") {
        try {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([{ user_id: userId, is_premium: false }])
            .select()

          if (insertError) {
            console.error("Error creating profile:", insertError)
            return NextResponse.json(
              {
                authenticated: true,
                isPremium: false,
                error: "profile_creation_failed",
              },
              { status: 200 },
            )
          }

          return NextResponse.json({
            authenticated: true,
            isPremium: false,
            profileStatus: "created",
          })
        } catch (err) {
          console.error("Exception creating profile:", err)
          return NextResponse.json(
            {
              authenticated: true,
              isPremium: false,
              error: "profile_creation_exception",
            },
            { status: 200 },
          )
        }
      }

      console.error("Error fetching profile:", profileError)
      return NextResponse.json(
        {
          authenticated: true,
          isPremium: false,
          error: "profile_fetch_failed",
        },
        { status: 200 },
      )
    }

    return NextResponse.json({
      authenticated: true,
      isPremium: !!profile?.is_premium,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        authenticated: false,
        error: "server_error",
        message: error instanceof Error ? error.message : "Unknown error",
        isPremium: false,
      },
      { status: 200 },
    )
  }
}
