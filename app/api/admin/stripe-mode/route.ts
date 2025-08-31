import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

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

// Helper function to verify admin status from headers as a fallback
async function verifyAdminFromHeaders(supabase: any, request: NextRequest) {
  const userId = request.headers.get("X-User-Id")
  const userEmail = request.headers.get("X-User-Email")

  if (!userId) return false

  // First try the standard way
  const isAdmin = await isUserAdmin(supabase, userId)
  if (isAdmin) return true

  // Fallback: check if this is a known admin email
  if (userEmail === "admin@example.com") {
    return true
  }

  return false
}

// Create a Supabase admin client with service role to bypass RLS
function createSupabaseAdmin() {
  return createRouteHandlerClient(
    { cookies: () => cookies() },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  )
}

// Helper function to ensure the stripe_mode setting exists
async function ensureStripeModeSetting(supabase: any) {
  try {
    // Create admin client to bypass RLS
    const supabaseAdmin = createSupabaseAdmin()

    // First check if the setting exists using admin client
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("id, key, value")
      .eq("key", "stripe_mode")
      .limit(1)

    if (error) {
      console.error("Error checking stripe_mode setting:", error)
      return false
    }

    // If no rows found, insert the default setting using admin client to bypass RLS
    if (!data || data.length === 0) {
      console.log("No stripe_mode setting found, inserting default...")

      // Try to insert the default setting with admin client
      const { error: insertError } = await supabaseAdmin.from("settings").insert({
        key: "stripe_mode",
        value: { live: false },
      })

      if (insertError) {
        // If we get a duplicate key error, the setting might have been created by another request
        if (insertError.message.includes("duplicate key")) {
          console.log("Duplicate key error, setting might already exist. Trying upsert instead.")

          // Try upsert instead
          const { error: upsertError } = await supabaseAdmin.from("settings").upsert(
            {
              key: "stripe_mode",
              value: { live: false },
            },
            { onConflict: "key" },
          )

          if (upsertError) {
            console.error("Error upserting default stripe_mode setting:", upsertError)
            return false
          }

          console.log("Default stripe_mode setting upserted successfully")
          return true
        }

        console.error("Error inserting default stripe_mode setting:", insertError)
        return false
      }

      console.log("Default stripe_mode setting inserted successfully")
      return true
    }

    // If multiple rows found, clean up duplicates using admin client
    if (data.length > 1) {
      console.log("Multiple stripe_mode settings found, cleaning up duplicates...")

      // Keep the first row and delete the rest
      const firstRow = data[0]

      // Delete all rows except the first one
      const { error: deleteError } = await supabaseAdmin
        .from("settings")
        .delete()
        .eq("key", "stripe_mode")
        .neq("id", firstRow.id)

      if (deleteError) {
        console.error("Error deleting duplicate stripe_mode settings:", deleteError)
        return false
      }

      console.log("Duplicate stripe_mode settings cleaned up successfully")
    }

    return true
  } catch (error) {
    console.error("Error in ensureStripeModeSetting:", error)
    return false
  }
}

// Helper function to run the migration if needed
async function ensureSettingsTable(supabase: any) {
  try {
    // Create admin client to bypass RLS
    const supabaseAdmin = createSupabaseAdmin()

    // Check if the settings table exists
    const { data, error } = await supabaseAdmin.from("settings").select("count").limit(1)

    if (error && error.code === "42P01") {
      // Table doesn't exist
      console.log("Settings table doesn't exist, creating it...")

      // Run the migration SQL directly
      const migrationSQL = `
        -- Create settings table if it doesn't exist
        CREATE TABLE IF NOT EXISTS settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT UNIQUE NOT NULL,
          value JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable Row Level Security
        ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Allow admin users to manage settings" ON settings;
        DROP POLICY IF EXISTS "Allow public read access to settings" ON settings;

        -- Create policy for admin users to have full access
        CREATE POLICY "Allow admin users to manage settings" 
        ON settings 
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid()
          )
        );

        -- Create policy for public read access to certain settings
        CREATE POLICY "Allow public read access to settings" 
        ON settings 
        FOR SELECT
        USING (
          key IN ('public_settings', 'app_name', 'app_description')
        );
      `

      // Execute the migration using rpc with admin client
      const { error: migrationError } = await supabaseAdmin.rpc("exec_sql", { sql: migrationSQL })

      if (migrationError) {
        console.error("Error running settings migration:", migrationError)
        return false
      }

      console.log("Settings table created successfully")

      // Insert default settings with admin client using upsert to avoid duplicate key errors
      const { error: upsertError } = await supabaseAdmin.from("settings").upsert(
        {
          key: "stripe_mode",
          value: { live: false },
        },
        { onConflict: "key" },
      )

      if (upsertError) {
        console.error("Error upserting default stripe_mode setting:", upsertError)
        return false
      }

      console.log("Default stripe_mode setting upserted successfully")
      return true
    } else if (error) {
      console.error("Error checking settings table:", error)
      return false
    }

    // Table exists, ensure the stripe_mode setting exists
    return await ensureStripeModeSetting(supabase)
  } catch (error) {
    console.error("Error in ensureSettingsTable:", error)
    return false
  }
}

// Helper function to update settings using service role (bypassing RLS)
async function updateSettingsWithServiceRole(key: string, value: any) {
  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createSupabaseAdmin()

    // First, clean up any duplicate settings
    const { data: existingData } = await supabaseAdmin.from("settings").select("id").eq("key", key)

    if (existingData && existingData.length > 1) {
      console.log(`Found ${existingData.length} duplicate settings for key ${key}, cleaning up...`)

      // Keep the first row and delete the rest
      const firstRowId = existingData[0].id

      // Delete all rows except the first one
      await supabaseAdmin.from("settings").delete().eq("key", key).neq("id", firstRowId)

      console.log("Duplicate settings cleaned up")
    }

    // Update the settings using the service role with upsert to avoid duplicate key errors
    const { data, error } = await supabaseAdmin.from("settings").upsert(
      {
        key,
        value,
      },
      { onConflict: "key" },
    )

    if (error) {
      console.error("Error updating settings with service role:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in updateSettingsWithServiceRole:", error)
    return { success: false, error }
  }
}

// Helper function to get the stripe mode with better error handling
async function getStripeMode(supabase: any) {
  try {
    // Create admin client to bypass RLS
    const supabaseAdmin = createSupabaseAdmin()

    // First ensure the settings table and stripe_mode setting exist
    const tableExists = await ensureSettingsTable(supabase)
    if (!tableExists) {
      console.log("Settings table or stripe_mode setting doesn't exist, falling back to env var")
      return {
        liveMode: process.env.STRIPE_LIVE_MODE === "true",
        source: "env",
        reason: "table_or_setting_missing",
      }
    }

    // Try to get the current mode from Supabase using admin client to avoid RLS issues
    const { data, error } = await supabaseAdmin.from("settings").select("value").eq("key", "stripe_mode").limit(1)

    if (error) {
      console.error("Error fetching stripe mode:", error)
      return {
        liveMode: process.env.STRIPE_LIVE_MODE === "true",
        source: "env",
        reason: "query_error",
        error: error.message,
      }
    }

    // If no data or empty array, fall back to env var
    if (!data || data.length === 0) {
      console.log("No stripe_mode setting found, falling back to env var")
      return {
        liveMode: process.env.STRIPE_LIVE_MODE === "true",
        source: "env",
        reason: "no_data",
      }
    }

    // Return the current mode from the database
    return {
      liveMode: data[0].value.live === true,
      source: "db_admin",
      reason: "success",
    }
  } catch (error: any) {
    console.error("Error in getStripeMode:", error)
    return {
      liveMode: process.env.STRIPE_LIVE_MODE === "true",
      source: "env",
      reason: "exception",
      error: error.message,
    }
  }
}

// Define a type for the authentication result
type AuthResult = {
  success: boolean
  status?: number
  error?: string
}

// Verify the user is authenticated and is an admin
async function verifyAdminAuth(request: NextRequest): Promise<AuthResult> {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const userId = session?.user?.id
  let isAdmin = false

  if (userId) {
    isAdmin = await isUserAdmin(supabase, userId)
  }

  if (!isAdmin) {
    isAdmin = await verifyAdminFromHeaders(supabase, request)

    if (!isAdmin) {
      console.log("Unauthorized access attempt")
      return { success: false, status: 401, error: "Unauthorized" }
    }
  }

  return { success: true }
}

export async function GET(request: import("next/server").NextRequest) {
  try {
    // Get the admin client with service role permissions
    const adminClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verify the user is authenticated and is an admin
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Get the current mode setting
    const { data, error } = await adminClient
      .from("settings")
      .select("value")
      .eq("key", "stripe_live_mode")
      .maybeSingle()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    // Convert the string value to boolean
    const liveMode = data?.value === "true"

    console.log("GET: Current liveMode setting:", liveMode)

    return NextResponse.json({
      liveMode,
      rawValue: data?.value,
      success: true,
    })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 })
  }
}

export async function POST(request: import("next/server").NextRequest) {
  try {
    // Get the admin client with service role permissions
    const adminClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verify the user is authenticated and is an admin
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Get the request body
    const body = await request.json()
    const { liveMode } = body

    console.log("POST: Setting liveMode to:", liveMode)

    // Convert boolean to string for storage
    const liveModeString = liveMode ? "true" : "false"

    // Update the mode setting
    const { data, error } = await adminClient
      .from("settings")
      .upsert({ key: "stripe_live_mode", value: liveModeString })
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      liveMode,
      data,
      message: `Stripe mode set to ${liveMode ? "live" : "test"}`,
    })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 })
  }
}
