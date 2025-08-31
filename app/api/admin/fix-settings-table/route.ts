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

    // SQL to fix the settings table structure
    const fixTableSQL = `
      -- Check if updated_at column exists and drop it if it does
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'settings' 
          AND column_name = 'updated_at'
        ) THEN
          ALTER TABLE settings DROP COLUMN updated_at;
        END IF;
      END $$;
      
      -- Make sure the table has the correct structure
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT UNIQUE NOT NULL,
        value JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Enable RLS
      ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
      
      -- Create or replace policies
      DROP POLICY IF EXISTS "Allow admin users to manage settings" ON settings;
      CREATE POLICY "Allow admin users to manage settings" 
      ON settings 
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM admin_users 
          WHERE admin_users.user_id = auth.uid()
        )
      );
      
      -- Insert default settings if they don't exist
      INSERT INTO settings (key, value)
      VALUES ('stripe_mode', '{"live": false}')
      ON CONFLICT (key) DO NOTHING;
    `

    // Execute the SQL
    const { error } = await supabaseAdmin.rpc("exec_sql", { sql: fixTableSQL })

    if (error) {
      console.error("Error fixing settings table:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Settings table structure fixed successfully",
    })
  } catch (error: any) {
    console.error("Error in fix-settings-table:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
