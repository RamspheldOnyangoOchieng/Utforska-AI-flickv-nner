"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a singleton instance to avoid multiple instances
let supabaseBrowserInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

const createClient = () => {
  if (!supabaseBrowserInstance) {
    supabaseBrowserInstance = createClientComponentClient<Database>()
  }
  return supabaseBrowserInstance
}

export { createClient }
