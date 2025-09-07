"use client"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a singleton instance to avoid multiple instances
let supabaseBrowserInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

const createClient = () => {
  if (!supabaseBrowserInstance) {
    supabaseBrowserInstance = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseBrowserInstance
}

export { createClient }
