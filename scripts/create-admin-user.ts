// This script should be run locally to set up the admin user
// You'll need to have the Supabase CLI installed and be logged in

import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import readline from "readline"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function createAdminUser() {
  try {
    // Create admin_users table if it doesn't exist
    const { error: tableError } = await supabase.rpc("create_admin_users_table", {})

    if (tableError && !tableError.message.includes("already exists")) {
      console.error("Error creating admin_users table:", tableError)
      return
    }

    // Prompt for admin email
    rl.question("Enter the admin email: ", async (email) => {
      // Check if user exists
      const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email)

      if (userError) {
        console.error("Error finding user:", userError)
        rl.close()
        return
      }

      if (!userData.user) {
        console.error("User not found. Please sign up first.")
        rl.close()
        return
      }

      // Add user to admin_users table
      const { error: insertError } = await supabase.from("admin_users").insert([{ user_id: userData.user.id }])

      if (insertError) {
        console.error("Error adding admin user:", insertError)
        rl.close()
        return
      }

      console.log(`User ${email} has been made an admin.`)
      rl.close()
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    rl.close()
  }
}

// Create the stored procedure for creating the admin_users table
async function setupStoredProcedure() {
  const { error } = await supabase.rpc("create_stored_procedure", {
    procedure_sql: `
      CREATE OR REPLACE FUNCTION create_admin_users_table()
      RETURNS void AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS admin_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create unique index on user_id
        CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_idx ON admin_users(user_id);
        
        -- Enable RLS
        ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for admins to read
        CREATE POLICY IF NOT EXISTS "Allow admins to read"
          ON admin_users FOR SELECT
          USING (auth.uid() IN (SELECT user_id FROM admin_users));
      END;
      $$ LANGUAGE plpgsql;
    `,
  })

  if (error) {
    console.error("Error creating stored procedure:", error)
    process.exit(1)
  }

  console.log("Stored procedure created successfully")
}

// Run the script
async function main() {
  await setupStoredProcedure()
  await createAdminUser()
}

main()
