import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"


const createClient = () => {
  return createServerComponentClient<Database>({
    cookies: () => cookies()
  })
}

// Add the missing named export that's being referenced elsewhere
export { createServerComponentClient as createServerClient }
export { createClient }
