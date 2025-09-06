import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Unified server client factory (Next.js 15 compatible async cookies accessor)
const createClient = () => createServerComponentClient({ cookies })

export { createClient }
