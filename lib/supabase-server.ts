import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// Next.js 15 requires awaiting cookies() before reading values.
export const createClient = async () => {
  // Defer accessing cookies until Supabase library calls it; Next 15 requires awaiting when accessed.
  return createServerComponentClient<Database>({
    cookies: async () => await cookies()
  })
}

// Add the missing named export that's being referenced elsewhere
export { createServerComponentClient as createServerClient }
