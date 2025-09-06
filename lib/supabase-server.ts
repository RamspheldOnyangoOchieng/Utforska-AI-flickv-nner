import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// Factory for server components / route handlers.
export const createClient = () => createServerComponentClient<Database>({ cookies })

export { createServerComponentClient as createServerClient }
