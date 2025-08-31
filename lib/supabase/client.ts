import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  try {
    if (!supabaseClient) {
      supabaseClient = createClientComponentClient<Database>()
      console.log("Created new Supabase client")
    }
    return supabaseClient
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    // Create a new client if there was an error with the existing one
    supabaseClient = createClientComponentClient<Database>()
    return supabaseClient
  }
}
