import supabase from "./supabase"

// SQL for creating the characters table and related objects
const createTableSQL = `
-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
age INTEGER NOT NULL CHECK (age >= 18),
image TEXT NOT NULL,
description TEXT NOT NULL,
personality TEXT,
occupation TEXT,
hobbies TEXT,
body TEXT,
ethnicity TEXT,
language TEXT,
relationship TEXT,
is_new BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
system_prompt TEXT NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS characters_created_at_idx ON characters (created_at DESC);

-- Enable Row Level Security
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "Allow public read access" ON characters;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON characters;

-- Create policy for public read access
CREATE POLICY "Allow public read access" 
ON characters FOR SELECT 
USING (true);

-- Create policy for authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users full access" 
ON characters FOR ALL 
USING (auth.role() = 'authenticated');

-- Create settings table for API keys and other configuration
CREATE TABLE IF NOT EXISTS app_settings (
id TEXT PRIMARY KEY,
value TEXT NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "Allow admin users full access to settings" ON app_settings;

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_idx ON admin_users(user_id);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "Allow admins to read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated users to insert into admin_users" ON admin_users;

-- Create policy for admins to read admin_users
CREATE POLICY "Allow admins to read admin_users"
ON admin_users FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Create policy for admins to insert into admin_users
CREATE POLICY "Allow authenticated users to insert into admin_users"
ON admin_users FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create policy for admin users to read/write settings
CREATE POLICY "Allow admin users full access to settings"
ON app_settings FOR ALL
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Create a view for listing users with admin status
CREATE OR REPLACE VIEW users_view AS
SELECT 
au.id,
au.email,
au.created_at,
au.raw_user_meta_data->>'username' as username,
(admin.id IS NOT NULL) as is_admin
FROM 
auth.users au
LEFT JOIN 
admin_users admin ON au.id = admin.user_id;

-- Create a stored procedure to ensure the admin_users table exists
CREATE OR REPLACE FUNCTION ensure_admin_users_table()
RETURNS void AS $$
BEGIN
  -- Create admin_users table if it doesn't exist
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
  DROP POLICY IF EXISTS "Allow admins to read admin_users" ON admin_users;
  CREATE POLICY "Allow admins to read admin_users"
    ON admin_users FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM admin_users));
  
  -- Create policy for authenticated users to insert
  DROP POLICY IF EXISTS "Allow authenticated users to insert into admin_users" ON admin_users;
  CREATE POLICY "Allow authenticated users to insert into admin_users"
    ON admin_users FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
END;
$$ LANGUAGE plpgsql;

-- Storage is handled by Cloudinary, no need for Supabase storage buckets
`

// Check if the characters table exists
export async function checkTableExists() {
  try {
    const { error } = await supabase.from("characters").select("id").limit(1)

    // If there's no error, the table exists
    return !error
  } catch (error) {
    console.error("Error checking if table exists:", error)
    return false
  }
}

// Check if the settings table exists
export async function checkSettingsTableExists() {
  try {
    const { error } = await supabase.from("app_settings").select("id").limit(1)

    // If there's no error, the table exists
    return !error
  } catch (error) {
    console.error("Error checking if settings table exists:", error)
    return false
  }
}

// Check if the admin_users table exists
export async function checkAdminUsersTableExists() {
  try {
    const { error } = await supabase.from("admin_users").select("id").limit(1)

    // If there's no error, the table exists
    return !error
  } catch (error) {
    console.error("Error checking if admin_users table exists:", error)
    return false
  }
}

// Initialize the database schema
export async function initializeDatabase() {
  try {
    // Check if table already exists
    const tableExists = await checkTableExists()
    const settingsTableExists = await checkSettingsTableExists()
    const adminUsersTableExists = await checkAdminUsersTableExists()

    if (tableExists && settingsTableExists && adminUsersTableExists) {
      console.log("Database tables already exist")
      return true
    }

    console.log("Creating database tables...")

    // Since we can't execute raw SQL directly through the client,
    // we'll need to use the REST API to create tables and policies

    // For this demo, we'll return false and instruct the user to run the SQL manually
    console.error(
      "Unable to automatically create database tables. Please run the SQL script manually in the Supabase SQL Editor.",
    )

    return false
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}

// Create admin_users table specifically
export async function createAdminUsersTable() {
  try {
    // Check if the table already exists
    const exists = await checkAdminUsersTableExists()

    if (exists) {
      return true
    }

    // We can't execute raw SQL directly, so we'll return false
    console.error(
      "Unable to automatically create admin_users table. Please run the SQL script manually in the Supabase SQL Editor.",
    )

    return false
  } catch (error) {
    console.error("Error creating admin_users table:", error)
    return false
  }
}

// Check if the images bucket exists
export async function checkStorageBucket() {
  try {
    // Check if storage bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error checking storage buckets:", bucketsError)
      return false
    }

    // Check if assets bucket exists (instead of images)
    const assetsBucketExists = buckets?.some((bucket) => bucket.name.toLowerCase() === "assets")
    return assetsBucketExists
  } catch (error) {
    console.error("Error checking storage bucket:", error)
    return false
  }
}

// Create the images storage bucket if it doesn't exist
export async function createStorageBucket(): Promise<boolean> {
  try {
    // Check if bucket already exists
    const bucketExists = await checkStorageBucket()

    if (bucketExists) {
      console.log("Storage bucket already exists")
      return true
    }

    // Create the bucket with name "assets" instead of "images"
    const { data, error } = await supabase.storage.createBucket("assets", {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    })

    if (error) {
      console.error("Error creating storage bucket:", error)
      return false
    }

    console.log("Storage bucket created successfully:", data)

    // We can't create policies directly, so we'll return true but warn the user
    console.warn(
      "Storage bucket created, but you'll need to manually set up the access policies in the Supabase dashboard.",
    )

    return true
  } catch (error) {
    console.error("Error creating storage bucket:", error)
    return false
  }
}

// Get the public URL for an image in the storage bucket
export function getPublicImageUrl(path: string): string {
  try {
    // Use the assets bucket instead of images
    const { data } = supabase.storage.from("assets").getPublicUrl(path)

    if (!data.publicUrl) {
      console.warn("No public URL was generated for path:", path)
      return `/placeholder.svg?height=400&width=300`
    }

    return data.publicUrl
  } catch (error) {
    console.error("Error getting public URL:", error)
    return `/placeholder.svg?height=400&width=300`
  }
}

// API Key Management
export async function getApiKey(key: string): Promise<string | null> {
  try {
    // First check if the table exists
    const { error: checkError } = await supabase.from("app_settings").select("count").limit(1)

    if (checkError && checkError.message.includes("does not exist")) {
      console.warn("app_settings table does not exist yet")
      return null
    }

    // If we get here, the table exists, so try to get the key
    // Use .maybeSingle() instead of .single() to handle cases where the row might not exist
    const { data, error } = await supabase.from("app_settings").select("value").eq("id", key).maybeSingle()

    if (error) {
      console.error("Error fetching API key:", error)
      return null
    }

    return data?.value || null
  } catch (error) {
    console.error("Error fetching API key:", error)
    return null
  }
}

export async function setApiKey(key: string, value: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("app_settings")
      .upsert({ id: key, value, updated_at: new Date().toISOString() })
      .select()

    if (error) {
      console.error("Error setting API key:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error setting API key:", error)
    return false
  }
}
