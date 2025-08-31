import { createClient as createServerClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Read from public vars first (works for middleware/client), then fall back to server-only names
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

// Validate environment variables
export const hasSupabaseConfig = !!supabaseUrl && !!supabaseAnonKey
if (!hasSupabaseConfig) {
  console.error("Missing Supabase environment variables. Please check your .env file.")
}

// Create a singleton instance for server usage
export const supabase = createServerClient<Database>(supabaseUrl || "", supabaseAnonKey || "")

// Helper function to create a new client when needed
export const createClient = () => {
  return createServerClient<Database>(supabaseUrl || "", supabaseAnonKey || "")
}

// Add default export for backward compatibility
export default supabase
