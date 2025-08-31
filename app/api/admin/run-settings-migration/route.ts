import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createRouteHandlerClient(
      { cookies: () => cookies() },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    )

    // Run the migration SQL directly
    const migrationSQL = `
      -- Create settings table if it doesn't exist
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT UNIQUE NOT NULL,
        value JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

      -- Insert default settings if they don't exist
      INSERT INTO settings (key, value)
      VALUES ('stripe_mode', '{"live": false}')
      ON CONFLICT (key) DO NOTHING;
    `

    // Execute the migration
    const { error: migrationError } = await supabaseAdmin.rpc("exec_sql", { sql: migrationSQL })

    if (migrationError) {
      console.error("Error running settings migration:", migrationError)
      return NextResponse.json(
        {
          success: false,
          error: migrationError.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Settings migration completed successfully",
    })
  } catch (error: any) {
    console.error("Error running settings migration:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
