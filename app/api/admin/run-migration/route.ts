import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { isAdmin } from "@/lib/auth"

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    // Get the user's token from the request
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: No valid authorization header" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Verify the token and get the user
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError) {
      return NextResponse.json(
        {
          error: "Authentication error",
          details: authError.message,
        },
        { status: 401 },
      )
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized: No user found" }, { status: 401 })
    }

    // Check if the user is an admin
    const adminStatus = await isAdmin(user.id)
    if (!adminStatus) {
      return NextResponse.json({ error: "Forbidden: User is not an admin" }, { status: 403 })
    }

    // Create the table directly using SQL
    const { error } = await supabaseAdmin.from("stripe_keys").select("id", { count: "exact", head: true })

    // If the table already exists, we're done
    if (!error || error.code !== "PGRST116") {
      return NextResponse.json({ success: true, message: "Table already exists" })
    }

    // Create the table using SQL
    const { error: createError } = await supabaseAdmin.rpc("create_stripe_keys_table")

    if (createError) {
      console.error("Error creating stripe_keys table:", createError)

      // If the function doesn't exist or fails, create the table directly
      const { error: directCreateError } = await supabaseAdmin.sql`
        CREATE TABLE IF NOT EXISTS public.stripe_keys (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          test_publishable_key TEXT,
          test_secret_key TEXT,
          live_publishable_key TEXT,
          live_secret_key TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Set up Row Level Security
        ALTER TABLE public.stripe_keys ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for admins to manage all rows
        CREATE POLICY IF NOT EXISTS admin_all ON public.stripe_keys
          USING (EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
          ));
          
        -- Grant permissions to authenticated users (RLS will restrict access)
        GRANT ALL ON public.stripe_keys TO authenticated;
      `

      if (directCreateError) {
        return NextResponse.json(
          {
            error: "Failed to create table directly",
            details: directCreateError.message,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in migration API:", error)
    return NextResponse.json(
      {
        error: "Server error during migration",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
